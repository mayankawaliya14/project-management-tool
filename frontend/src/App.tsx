import { useEffect, useState } from "react";
import { ApolloProvider } from "@apollo/client/react";
import { client } from "./apollo";
import ProjectList from "./components/ProjectList";
import { OrganizationList } from "./components/OrganizationList";

type ViewMode = 'projects' | 'organizations';

export default function App() {
  const [orgSlug, setOrgSlug] = useState<string>(() => {
    return localStorage.getItem("orgSlug") || "acme";
  });
  
  const [currentView, setCurrentView] = useState<ViewMode>('projects');

  useEffect(() => {
    if (!localStorage.getItem("orgSlug"))
      localStorage.setItem("orgSlug", "acme");
  }, []);

  const handleOrgSlugChange = (newSlug: string) => {
    setOrgSlug(newSlug);
    localStorage.setItem("orgSlug", newSlug);
  };

  return (
    <ApolloProvider client={client}>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <header className="p-4 shadow bg-white">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <h1 className="text-2xl font-bold">Project Manager</h1>
            <div className="flex items-center gap-4">
              <nav className="flex gap-2">
                <button
                  onClick={() => setCurrentView('organizations')}
                  className={`px-3 py-1 rounded text-sm ${
                    currentView === 'organizations'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Organizations
                </button>
                <button
                  onClick={() => setCurrentView('projects')}
                  className={`px-3 py-1 rounded text-sm ${
                    currentView === 'projects'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Projects
                </button>
              </nav>
              {currentView === 'projects' && (
                <div className="flex items-center gap-2">
                  <label className="text-sm">Org Slug</label>
                  <input
                    className="border rounded px-2 py-1"
                    value={orgSlug}
                    onChange={(e) => handleOrgSlugChange(e.target.value)}
                    onBlur={(e) => handleOrgSlugChange(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="max-w-6xl mx-auto">
          {currentView === 'organizations' ? (
            <OrganizationList />
          ) : (
            <div className="p-4">
              <ProjectList key={orgSlug} />
            </div>
          )}
        </main>
      </div>
    </ApolloProvider>
  );
}
