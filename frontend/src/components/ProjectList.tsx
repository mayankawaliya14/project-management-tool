import { useQuery } from "@apollo/client/react";
import { GET_PROJECTS } from "../graphql/queries";
import type { Project } from "../types";
import ProjectForm from "./ProjectForm";
import TaskBoard from "./TaskBoard";
import { useState } from "react";

export default function ProjectList() {
  const { data, loading, error, refetch } = useQuery(GET_PROJECTS);
  const [selected, setSelected] = useState<Project | null>(null);

  if (loading) return <p>Loading projects…</p>;
  if (error) return <p className="text-red-600">Error: {error.message}</p>;

  const projects: Project[] = data?.projects ?? [];
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold">Projects</h2>
          <ProjectForm onDone={() => refetch()} />
        </div>
        <ul className="space-y-2">
          {projects.map((p) => (
            <li
              key={p.id}
              className={`p-3 rounded bg-white shadow hover:shadow-md cursor-pointer ${
                selected?.id === p.id ? "ring-2 ring-indigo-500" : ""
              }`}
              onClick={() => setSelected(p)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-sm text-gray-500">{p.description}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded bg-gray-100">
                    {p.status}
                  </span>
                  <ProjectForm 
                    project={p} 
                    mode="edit" 
                    onDone={() => refetch()} 
                  />
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Tasks: {p.taskCount} • Done: {p.completedTasks} •{" "}
                {(p.completionRate * 100).toFixed(0)}%
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div>
        {selected ? (
          <TaskBoard project={selected} />
        ) : (
          <div className="p-6 rounded bg-white shadow text-gray-500">
            Select a project to view tasks.
          </div>
        )}
      </div>
    </div>
  );
}
