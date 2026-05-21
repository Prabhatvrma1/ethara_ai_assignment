import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', members: [] });

  const fetchProjects = async () => {
    const res = await api.get('/projects');
    setProjects(res.data.data);
  };

  const fetchUsers = async () => {
    const res = await api.get('/auth/users');
    setAllUsers(res.data.data);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchProjects();
        // Only admins can see all users
        if (user?.role === 'admin') {
          await fetchUsers();
        }
      } catch (err) {
        toast.error('Unable to load projects');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user?.role]);

  const resetModal = () => {
    setForm({ name: '', description: '', members: [] });
    setShowModal(false);
  };

  const toggleMember = (userId) => {
    setForm((prev) => ({
      ...prev,
      members: prev.members.includes(userId)
        ? prev.members.filter((id) => id !== userId)
        : [...prev.members, userId],
    }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      toast.error('Project name is required');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/projects', {
        name: form.name.trim(),
        description: form.description.trim(),
        members: form.members,
      });
      toast.success('Project created');
      resetModal();
      await fetchProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to create project');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm('Delete this project and every task inside it?')) return;

    try {
      await api.delete(`/projects/${projectId}`);
      setProjects((prev) => prev.filter((project) => project._id !== projectId));
      toast.success('Project deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to delete project');
    }
  };

  if (loading) {
    return (
      <div className="panel-loading">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Projects</p>
          <h1>Team workspaces</h1>
          <p className="subtitle">
            {projects.length} active project{projects.length === 1 ? '' : 's'}
          </p>
        </div>
        {user?.role === 'admin' && (
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            New project
          </button>
        )}
      </header>

      {projects.length === 0 ? (
        <section className="surface empty-state">
          <h3>No projects yet</h3>
          {user?.role === 'admin' ? (
            <>
              <p>Start with a project, then assign tasks and track delivery from one place.</p>
              <button className="btn-primary" onClick={() => setShowModal(true)}>
                Create project
              </button>
            </>
          ) : (
            <p>Ask an admin to create a project and add you as a member.</p>
          )}
        </section>
      ) : (
        <section className="projects-grid">
          {projects.map((project) => {
            const canManage = user.role === 'admin';

            return (
              <article key={project._id} className="project-card">
                <div className="project-card-header">
                  <div>
                    <h2>
                      <Link to={`/projects/${project._id}`}>{project.name}</Link>
                    </h2>
                    <p>{project.description || 'No description yet.'}</p>
                  </div>
                  {canManage && (
                    <button
                      className="icon-button danger"
                      onClick={() => handleDelete(project._id)}
                      aria-label={`Delete ${project.name}`}
                      title="Delete project"
                    >
                      x
                    </button>
                  )}
                </div>

                <div className="project-meta">
                  <span>Owner: {project.owner?.name || 'Unknown'}</span>
                  <span>{project.members?.length || 0} members</span>
                </div>

                <Link to={`/projects/${project._id}`} className="btn-secondary btn-sm">
                  Open project
                </Link>
              </article>
            );
          })}
        </section>
      )}

      {showModal && user?.role === 'admin' && (
        <div className="modal-overlay" onClick={resetModal}>
          <section className="modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Create project</h2>
                <p>Add teammates now, or bring them in later.</p>
              </div>
              <button className="icon-button" onClick={resetModal} aria-label="Close modal">
                x
              </button>
            </div>

            <form onSubmit={handleCreate} className="modal-form">
              <label className="form-group" htmlFor="project-name">
                Project name
                <input
                  id="project-name"
                  type="text"
                  placeholder="Customer Portal"
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                />
              </label>

              <label className="form-group" htmlFor="project-description">
                Description
                <textarea
                  id="project-description"
                  rows={3}
                  placeholder="What is this team trying to ship?"
                  value={form.description}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, description: event.target.value }))
                  }
                />
              </label>

              <div className="form-group">
                <span>Members</span>
                <div className="members-list">
                  {allUsers
                    .filter((candidate) => candidate._id !== user._id)
                    .map((candidate) => (
                      <label key={candidate._id} className="member-checkbox">
                        <input
                          type="checkbox"
                          checked={form.members.includes(candidate._id)}
                          onChange={() => toggleMember(candidate._id)}
                        />
                        <span>{candidate.name}</span>
                        <small>{candidate.role}</small>
                      </label>
                    ))}

                  {allUsers.filter((candidate) => candidate._id !== user._id).length === 0 && (
                    <p className="text-muted">No other users have registered yet.</p>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={resetModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create project'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
