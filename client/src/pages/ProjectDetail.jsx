import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const emptyTaskForm = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  assignee: '',
  dueDate: '',
};

const statusOptions = [
  ['all', 'All'],
  ['todo', 'To do'],
  ['in_progress', 'In progress'],
  ['review', 'Review'],
  ['done', 'Done'],
];

const priorityOptions = [
  ['low', 'Low'],
  ['medium', 'Medium'],
  ['high', 'High'],
  ['urgent', 'Urgent'],
];

export default function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [taskForm, setTaskForm] = useState(emptyTaskForm);
  const [savingTask, setSavingTask] = useState(false);

  const fetchProjectAndTasks = async () => {
    const [projectRes, tasksRes] = await Promise.all([
      api.get(`/projects/${projectId}`),
      api.get(`/tasks/project/${projectId}`),
    ]);
    setProject(projectRes.data.data);
    setTasks(tasksRes.data.data);
  };

  useEffect(() => {
    fetchProjectAndTasks()
      .catch((err) => {
        toast.error(err.response?.data?.message || 'Unable to load project');
        navigate('/projects');
      })
      .finally(() => setLoading(false));
  }, [projectId]);

  const canManage = project && user.role === 'admin';
  
  // Check if user can only edit status (is assignee but not admin)
  const canOnlyEditStatus = editingTask && 
    user.role !== 'admin' && 
    editingTask.assignee?._id === user._id;

  const filteredTasks = useMemo(
    () =>
      filterStatus === 'all'
        ? tasks
        : tasks.filter((task) => task.status === filterStatus),
    [filterStatus, tasks]
  );

  const closeTaskModal = () => {
    setShowTaskModal(false);
    setEditingTask(null);
    setTaskForm(emptyTaskForm);
  };

  const openTaskModal = (task = null) => {
    setEditingTask(task);
    setTaskForm(
      task
        ? {
            title: task.title,
            description: task.description || '',
            status: task.status,
            priority: task.priority,
            assignee: task.assignee?._id || '',
            dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
          }
        : emptyTaskForm
    );
    setShowTaskModal(true);
  };

  const handleSaveTask = async (event) => {
    event.preventDefault();

    // Determine if member is only updating status
    const isMemberStatusUpdate = canOnlyEditStatus;

    // Validate title only for new tasks or admin edits
    if (!isMemberStatusUpdate && !taskForm.title.trim()) {
      toast.error('Task title is required');
      return;
    }

    setSavingTask(true);
    try {
      let payload;
      
      // Members can only send status field
      if (isMemberStatusUpdate) {
        payload = { status: taskForm.status };
      } else {
        // Admins can send all fields
        payload = { ...taskForm, title: taskForm.title.trim() };
      }

      if (editingTask) {
        await api.put(`/tasks/${editingTask._id}`, payload);
        toast.success('Task updated');
      } else {
        await api.post(`/tasks/project/${projectId}`, payload);
        toast.success('Task created');
      }
      closeTaskModal();
      await fetchProjectAndTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to save task');
    } finally {
      setSavingTask(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;

    try {
      await api.delete(`/tasks/${taskId}`);
      toast.success('Task deleted');
      await fetchProjectAndTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to delete task');
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm('Delete this project and every task inside it?')) return;

    try {
      await api.delete(`/projects/${projectId}`);
      toast.success('Project deleted');
      navigate('/projects');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to delete project');
    }
  };

  const formatDate = (date) => (date ? new Date(date).toLocaleDateString() : 'No date');

  if (loading) {
    return (
      <div className="panel-loading">
        <div className="spinner" />
      </div>
    );
  }

  if (!project) {
    return (
      <section className="surface empty-state">
        <h3>Project not found</h3>
        <Link to="/projects" className="btn-secondary">Back to projects</Link>
      </section>
    );
  }

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <Link to="/projects" className="back-link">Back to projects</Link>
          <h1>{project.name}</h1>
          <p className="subtitle">{project.description || 'No description yet.'}</p>
        </div>
        {canManage && (
          <button onClick={handleDeleteProject} className="btn-danger">
            Delete project
          </button>
        )}
      </header>

      <section className="stats-grid compact">
        <article className="stat-card">
          <span className="stat-label">Owner</span>
          <strong className="meta-value">{project.owner?.name}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-label">Members</span>
          <strong className="meta-value">{project.members.length}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-label">Tasks</span>
          <strong className="meta-value">{tasks.length}</strong>
        </article>
      </section>

      <section className="surface">
        <div className="section-header">
          <div>
            <h2>Tasks</h2>
            <p className="section-note">Create, assign, and move work through the delivery flow.</p>
          </div>
          <div className="toolbar">
            <select value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)}>
              {statusOptions.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            {user.role === 'admin' && (
              <button onClick={() => openTaskModal()} className="btn-primary">
                New task
              </button>
            )}
          </div>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="empty-state">
            <h3>No tasks in this view</h3>
            <p>Add a task or switch the status filter.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Assignee</th>
                  <th>Due</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task) => (
                  <tr key={task._id}>
                    <td>
                      {canManage || task.assignee?._id === user._id ? (
                        <button onClick={() => openTaskModal(task)} className="link-button">
                          {task.title}
                        </button>
                      ) : (
                        <span>{task.title}</span>
                      )}
                    </td>
                    <td>
                      <span className={`status-badge ${task.status}`}>
                        {statusOptions.find(([value]) => value === task.status)?.[1]}
                      </span>
                    </td>
                    <td>
                      <span className={`priority-badge ${task.priority}`}>
                        {priorityOptions.find(([value]) => value === task.priority)?.[1]}
                      </span>
                    </td>
                    <td>{task.assignee?.name || 'Unassigned'}</td>
                    <td>{formatDate(task.dueDate)}</td>
                    <td>
                      {user.role === 'admin' ? (
                        <button
                          onClick={() => handleDeleteTask(task._id)}
                          className="icon-button danger"
                          aria-label={`Delete ${task.title}`}
                          title="Delete task"
                        >
                          x
                        </button>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showTaskModal && (
        <div className="modal-overlay" onClick={closeTaskModal}>
          <section className="modal" onClick={(event) => event.stopPropagation()}>
            {/* MEMBER-ONLY VIEW: Status Update Only */}
            {canOnlyEditStatus && editingTask ? (
              <>
                <div className="modal-header">
                  <div>
                    <h2>Update task</h2>
                    <p>Update task progress (status only)</p>
                  </div>
                  <button className="icon-button" onClick={closeTaskModal} aria-label="Close modal">
                    x
                  </button>
                </div>

                <form onSubmit={handleSaveTask} className="modal-form">
                  {/* Read-only Task Details */}
                  <div className="form-group info-box">
                    <p className="info-box-title">📋 Task Details (Read-only)</p>
                    <p><strong>Title:</strong> {editingTask.title}</p>
                    <p><strong>Description:</strong> {editingTask.description || 'No description'}</p>
                    <p><strong>Priority:</strong> {priorityOptions.find(([value]) => value === editingTask.priority)?.[1]}</p>
                    <p><strong>Assigned to:</strong> {editingTask.assignee?.name || 'Unassigned'}</p>
                    <p><strong>Due date:</strong> {formatDate(editingTask.dueDate)}</p>
                  </div>

                  {/* ONLY Status Field for Members */}
                  <label className="form-group" htmlFor="task-status">
                    Status
                    <select
                      id="task-status"
                      value={taskForm.status}
                      onChange={(event) => setTaskForm({ ...taskForm, status: event.target.value })}
                    >
                      {statusOptions.slice(1).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </label>

                  <div className="modal-footer">
                    <button type="button" className="btn-secondary" onClick={closeTaskModal}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary" disabled={savingTask}>
                      {savingTask ? 'Saving...' : 'Save task'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              /* ADMIN VIEW: Full Task Editing */
              <>
                <div className="modal-header">
                  <div>
                    <h2>{editingTask ? 'Edit task' : 'New task'}</h2>
                    <p>{editingTask ? 'Update assignment and progress.' : 'Add work to this project.'}</p>
                  </div>
                  <button className="icon-button" onClick={closeTaskModal} aria-label="Close modal">
                    x
                  </button>
                </div>

                <form onSubmit={handleSaveTask} className="modal-form">
                  <label className="form-group" htmlFor="task-title">
                    Title
                    <input
                      id="task-title"
                      type="text"
                      value={taskForm.title}
                      onChange={(event) => setTaskForm({ ...taskForm, title: event.target.value })}
                      placeholder="Write acceptance criteria"
                    />
                  </label>

                  <label className="form-group" htmlFor="task-description">
                    Description
                    <textarea
                      id="task-description"
                      rows={3}
                      value={taskForm.description}
                      onChange={(event) =>
                        setTaskForm({ ...taskForm, description: event.target.value })
                      }
                      placeholder="Add context, links, or expected outcome"
                    />
                  </label>

                  <div className="form-row">
                    <label className="form-group" htmlFor="task-status">
                      Status
                      <select
                        id="task-status"
                        value={taskForm.status}
                        onChange={(event) => setTaskForm({ ...taskForm, status: event.target.value })}
                      >
                        {statusOptions.slice(1).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </label>

                    <label className="form-group" htmlFor="task-priority">
                      Priority
                      <select
                        id="task-priority"
                        value={taskForm.priority}
                        onChange={(event) => setTaskForm({ ...taskForm, priority: event.target.value })}
                      >
                        {priorityOptions.map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="form-row">
                    <label className="form-group" htmlFor="task-assignee">
                      Assignee
                      <select
                        id="task-assignee"
                        value={taskForm.assignee}
                        onChange={(event) => setTaskForm({ ...taskForm, assignee: event.target.value })}
                      >
                        <option value="">Unassigned</option>
                        {project.members.map((member) => (
                          <option key={member._id} value={member._id}>{member.name}</option>
                        ))}
                      </select>
                    </label>

                    <label className="form-group" htmlFor="task-due">
                      Due date
                      <input
                        id="task-due"
                        type="date"
                        value={taskForm.dueDate}
                        onChange={(event) => setTaskForm({ ...taskForm, dueDate: event.target.value })}
                      />
                    </label>
                  </div>

                  <div className="modal-footer">
                    <button type="button" className="btn-secondary" onClick={closeTaskModal}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary" disabled={savingTask}>
                      {savingTask ? 'Saving...' : 'Save task'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
