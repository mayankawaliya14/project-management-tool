import { useState, useEffect } from "react";
import { useMutation } from "@apollo/client/react";
import { CREATE_TASK, UPDATE_TASK } from "../graphql/mutations";
import type { Task } from "../types";

export default function TaskForm({
  projectId,
  onDone,
  task,
  mode = 'create',
}: {
  projectId: string;
  onDone: () => void;
  task?: Task | null;
  mode?: 'create' | 'edit';
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeEmail, setAssigneeEmail] = useState("");
  const [status, setStatus] = useState<"TODO" | "IN_PROGRESS" | "DONE">("TODO");
  
  const [createTask, { loading: createLoading, error: createError }] = useMutation(CREATE_TASK, {
    variables: { projectId, title, description, status, assigneeEmail },
    optimisticResponse: {
      createTask: {
        __typename: "CreateTask",
        task: {
          __typename: "Task",
          id: `temp-${Math.random()}`,
          title,
          description,
          status,
          assigneeEmail,
          dueDate: null,
        },
      },
    },
  });

  const [updateTask, { loading: updateLoading, error: updateError }] = useMutation(UPDATE_TASK, {
    variables: {
      id: task?.id,
      title,
      description,
      status,
      assigneeEmail,
    },
  });

  const loading = createLoading || updateLoading;
  const error = createError || updateError;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return alert("Title is required");
    
    try {
      if (mode === 'edit') {
        await updateTask();
      } else {
        await createTask();
      }
      handleClose();
      onDone();
    } catch (err) {
      console.error(`Failed to ${mode} task:`, err);
    }
  };

  const handleClose = () => {
    setOpen(false);
    if (mode === 'create') {
      setTitle("");
      setDescription("");
      setAssigneeEmail("");
      setStatus("TODO");
    }
  };

  useEffect(() => {
    if (task && mode === 'edit') {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setAssigneeEmail(task.assigneeEmail || "");
      setStatus(task.status || "TODO");
    }
  }, [task, mode]);

  return (
    <div>
      <button
        className={mode === 'edit' ? "px-2 py-1 bg-blue-600 text-white rounded text-xs" : "px-3 py-1 border rounded"}
        onClick={() => setOpen(true)}
      >
        {mode === 'edit' ? 'Edit' : 'Add Task'}
      </button>
      {open && (
        <div className="fixed inset-0 bg-black/30 grid place-items-center">
          <form
            className="bg-white p-4 rounded shadow w-96 space-y-2"
            onSubmit={submit}
          >
            <h3 className="font-semibold text-lg">{mode === 'edit' ? 'Edit Task' : 'New Task'}</h3>
            {error && <p className="text-red-600 text-sm">{error.message}</p>}
            <input
              className="w-full border rounded px-2 py-1"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              className="w-full border rounded px-2 py-1"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <input
              className="w-full border rounded px-2 py-1"
              placeholder="Assignee Email"
              value={assigneeEmail}
              onChange={(e) => setAssigneeEmail(e.target.value)}
            />
            <select
              className="w-full border rounded px-2 py-1"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
            >
              <option value="TODO">TODO</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="DONE">DONE</option>
            </select>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                className="px-3 py-1 border rounded"
                onClick={handleClose}
              >
                Cancel
              </button>
              <button
                disabled={loading}
                className="px-3 py-1 bg-indigo-600 text-white rounded"
              >
                {loading ? (mode === 'edit' ? 'Updating...' : 'Saving...') : (mode === 'edit' ? 'Update Task' : 'Save')}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
