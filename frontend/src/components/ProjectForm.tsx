import { useState, useEffect } from "react";
import { useMutation } from "@apollo/client/react";
import { CREATE_PROJECT, UPDATE_PROJECT } from "../graphql/mutations";
import { GET_PROJECTS } from "../graphql/queries";
import type { ProjectFormData, Project } from "../types";

interface ProjectFormProps {
  onDone: () => void;
  project?: Project | null;
  mode?: 'create' | 'edit';
}

export default function ProjectForm({ onDone, project, mode = 'create' }: ProjectFormProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<ProjectFormData>({
    name: "",
    description: "",
    status: "ACTIVE",
    dueDate: "",
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const [createProject, { loading: createLoading, error: createError }] = useMutation(CREATE_PROJECT, {
    variables: { 
      inputName: formData.name,
      description: formData.description,
      status: formData.status,
      dueDate: formData.dueDate || null
    },
    optimisticResponse: {
      createProject: {
        __typename: "CreateProject",
        project: {
          __typename: "Project",
          id: `temp-${Math.random()}`,
          name: formData.name,
          description: formData.description,
          status: formData.status,
          dueDate: formData.dueDate || null,
          taskCount: 0,
          completedTasks: 0,
          completionRate: 0,
        },
      },
    },
    update(cache, { data }) {
      const newProj = data?.createProject?.project;
      if (!newProj) return;
      const existing: any = cache.readQuery({ query: GET_PROJECTS });
      cache.writeQuery({
        query: GET_PROJECTS,
        data: { projects: [newProj, ...(existing?.projects || [])] },
      });
    },
  });

  const [updateProject, { loading: updateLoading, error: updateError }] = useMutation(UPDATE_PROJECT, {
    variables: {
      id: project?.id,
      name: formData.name,
      description: formData.description,
      status: formData.status,
      dueDate: formData.dueDate || null
    },
  });

  const loading = createLoading || updateLoading;
  const error = createError || updateError;

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = "Project name is required";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Project name must be at least 2 characters long";
    }

    if (formData.dueDate) {
      const dueDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dueDate < today) {
        errors.dueDate = "Due date cannot be in the past";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      if (mode === 'edit') {
        await updateProject();
      } else {
        await createProject();
      }
      handleClose();
      onDone();
    } catch (err) {
      console.error(`Failed to ${mode} project:`, err);
    }
  };

  const handleClose = () => {
    setOpen(false);
    if (mode === 'create') {
      setFormData({
        name: "",
        description: "",
        status: "ACTIVE",
        dueDate: "",
      });
    }
    setValidationErrors({});
  };

  useEffect(() => {
    if (project && mode === 'edit') {
      setFormData({
        name: project.name || "",
        description: project.description || "",
        status: project.status || "ACTIVE",
        dueDate: project.dueDate || "",
      });
    }
  }, [project, mode]);

  const handleInputChange = (field: keyof ProjectFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div>
      <button
        className={mode === 'edit' ? "px-3 py-1 bg-blue-600 text-white rounded text-sm" : "px-3 py-1 bg-indigo-600 text-white rounded"}
        onClick={() => setOpen(true)}
      >
        {mode === 'edit' ? 'Edit' : 'New Project'}
      </button>
      {open && (
        <div className="fixed inset-0 bg-black/30 grid place-items-center z-50">
          <form
            className="bg-white p-6 rounded-lg shadow-xl w-96 space-y-4"
            onSubmit={handleSubmit}
          >
            <h3 className="font-semibold text-xl text-gray-900">{mode === 'edit' ? 'Edit Project' : 'Create Project'}</h3>
            
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error.message}</p>
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Project Name *
              </label>
              <input
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  validationErrors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter project name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
              {validationErrors.name && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Project description (optional)"
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
              >
                <option value="ACTIVE">Active</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Due Date
              </label>
              <input
                type="date"
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  validationErrors.dueDate ? 'border-red-300' : 'border-gray-300'
                }`}
                value={formData.dueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
              />
              {validationErrors.dueDate && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.dueDate}</p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                onClick={handleClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (mode === 'edit' ? 'Updating...' : 'Creating...') : (mode === 'edit' ? 'Update Project' : 'Create Project')}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
