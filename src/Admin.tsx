import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Edit, Trash2 } from "lucide-react";
import ProjectEditor from "./ProjectEditor";

export default function Admin() {
  const [projects, setProjects] = useState<any[]>([]);
  const [editingProject, setEditingProject] = useState<any | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      if (!res.ok) {
        const text = await res.text();
        console.error("Failed to load projects. Status:", res.status, "Body:", text);
        throw new Error(`Failed to load projects: ${res.status}`);
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setProjects(data);
      } else {
        console.error("Projects data is not an array:", data);
        setProjects([]);
      }
    } catch (err: any) {
      console.error("Failed to load projects", err);
      setProjects([]);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this project?")) {
      const token = localStorage.getItem('adminToken');
      fetch(`/api/projects/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => {
          if (res.status === 401 || res.status === 403) {
            localStorage.removeItem('adminToken');
            window.location.href = '/login';
            throw new Error('Unauthorized');
          }
          return fetchProjects();
        })
        .catch(err => console.error("Failed to delete project", err));
    }
  };

  const handleSave = (projectData: any) => {
    const url = editingProject ? `/api/projects/${editingProject.id}` : '/api/projects';
    const method = editingProject ? 'PUT' : 'POST';
    const token = localStorage.getItem('adminToken');

    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(projectData)
    })
      .then(res => {
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem('adminToken');
          window.location.href = '/login';
          throw new Error('Unauthorized');
        }
        setEditingProject(null);
        setIsCreating(false);
        fetchProjects();
      })
      .catch(err => console.error("Failed to save project", err));
  };

  if (isCreating || editingProject) {
    return (
      <ProjectEditor
        project={editingProject}
        onSave={handleSave}
        onCancel={() => {
          setEditingProject(null);
          setIsCreating(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-dark text-white p-8 selection:bg-accent selection:text-dark">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-3xl font-serif italic">Admin Dashboard</h1>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 bg-accent text-dark px-6 py-3 rounded-xl font-bold text-sm tracking-widest uppercase hover:bg-white transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>

        <div className="bg-surface/40 border border-white/5 rounded-3xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-widest text-white/40">
                <th className="p-6 font-medium">Project</th>
                <th className="p-6 font-medium">Tag</th>
                <th className="p-6 font-medium">Year</th>
                <th className="p-6 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(project => (
                <tr key={project.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <img src={project.image} alt={project.title} className="w-12 h-12 rounded-lg object-cover" referrerPolicy="no-referrer" />
                      <div>
                        <div className="font-bold text-lg">{project.title}</div>
                        <div className="text-xs text-white/40 max-w-xs truncate">{project.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-sm text-white/60">{project.tag}</td>
                  <td className="p-6 text-sm text-white/60">{project.year}</td>
                  <td className="p-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingProject(project)}
                        className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="p-2 text-white/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {projects.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-white/40">
                    No projects found. Create one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
