import { useQuery } from "@apollo/client/react";
import { GET_TASKS } from "../graphql/queries";
import type { Project, Task } from "../types";
import TaskForm from "./TaskForm";
import TaskComments from "./TaskComments";
import { useState } from "react";

export default function TaskBoard({ project }: { project: Project }) {
  const { data, loading, error, refetch } = useQuery(GET_TASKS, {
    variables: { projectId: project.id },
  });
  const [selected, setSelected] = useState<Task | null>(null);

  if (loading) return <p>Loading tasks…</p>;
  if (error) return <p className="text-red-600">Error: {error.message}</p>;

  const tasks: Task[] = data?.tasks ?? [];
  const groups: Record<string, Task[]> = {
    TODO: [],
    IN_PROGRESS: [],
    DONE: [],
  };
  for (const t of tasks) groups[t.status].push(t);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-semibold">{project.name} — Tasks</h3>
        <TaskForm projectId={project.id} onDone={() => refetch()} />
      </div>
      <div className="grid md:grid-cols-3 gap-3">
        {(["TODO", "IN_PROGRESS", "DONE"] as const).map((col) => (
          <div key={col} className="bg-white rounded p-3 shadow">
            <div className="font-semibold mb-2">{col.replace("_", " ")}</div>
            <ul className="space-y-2">
              {groups[col].map((t) => (
                <li
                  key={t.id}
                  className={`p-2 rounded border hover:shadow ${
                    selected?.id === t.id ? "ring-2 ring-indigo-500" : ""
                  }`}
                >
                  <div 
                    className="cursor-pointer" 
                    onClick={() => setSelected(t)}
                  >
                    <div className="font-medium">{t.title}</div>
                    <div className="text-xs text-gray-500">
                      {t.assigneeEmail || "Unassigned"}
                    </div>
                  </div>
                  <div className="mt-2 flex justify-end">
                    <TaskForm 
                      projectId={project.id} 
                      task={t} 
                      mode="edit" 
                      onDone={() => refetch()} 
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {selected && (
        <div className="mt-4 grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded p-4 shadow">
            <div className="font-semibold mb-2">Task Details</div>
            <div className="text-sm">{selected.description || "—"}</div>
          </div>
          <TaskComments taskId={selected.id} projectId={project.id} />
        </div>
      )}
    </div>
  );
}
