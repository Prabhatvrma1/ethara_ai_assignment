import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const statusLabel = {
  todo: 'To do',
  in_progress: 'In progress',
  review: 'Review',
  done: 'Done',
};

const priorityLabel = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tasksRequest = user.role === 'admin' ? api.get('/tasks/all') : api.get('/tasks/my');
        const [statsRes, tasksRes] = await Promise.all([
          api.get('/tasks/dashboard'),
          tasksRequest,
        ]);

        setStats(statsRes.data.data);
        setRecentTasks(tasksRes.data.data.slice(0, 8));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.role]);

  const formatDate = (date) => {
    if (!date) return 'No date';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const isOverdue = (task) =>
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

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
          <p className="eyebrow">{user.role === 'admin' ? 'Workspace overview' : 'My workload'}</p>
          <h1>Dashboard</h1>
          <p className="subtitle">Welcome back, {user.name}. Here is what needs attention.</p>
        </div>
        <Link to="/projects" className="btn-primary">
          New project
        </Link>
      </header>

      <section className="stats-grid" aria-label="Task summary">
        <article className="stat-card">
          <span className="stat-label">Total tasks</span>
          <strong className="stat-value">{stats?.total || 0}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-label">In progress</span>
          <strong className="stat-value">{stats?.inProgress || 0}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-label">Completed</span>
          <strong className="stat-value">{stats?.done || 0}</strong>
        </article>
        <article className="stat-card warning">
          <span className="stat-label">Overdue</span>
          <strong className="stat-value">{stats?.overdue || 0}</strong>
        </article>
      </section>

      <section className="surface">
        <div className="section-header">
          <div>
            <h2>Recent tasks</h2>
            <p className="section-note">
              {user.role === 'admin' ? 'Latest tasks across all projects.' : 'Latest tasks assigned to you.'}
            </p>
          </div>
          <Link to="/projects" className="link-subtle">
            View projects
          </Link>
        </div>

        {recentTasks.length === 0 ? (
          <div className="empty-state">
            <h3>No tasks yet</h3>
            <p>Create a project, invite teammates, and add the first task.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Project</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Due</th>
                </tr>
              </thead>
              <tbody>
                {recentTasks.map((task) => (
                  <tr key={task._id} className={isOverdue(task) ? 'row-overdue' : ''}>
                    <td className="strong-cell">{task.title}</td>
                    <td>{task.project?.name || 'Unassigned'}</td>
                    <td>
                      <span className={`status-badge ${task.status}`}>
                        {statusLabel[task.status]}
                      </span>
                    </td>
                    <td>
                      <span className={`priority-badge ${task.priority}`}>
                        {priorityLabel[task.priority]}
                      </span>
                    </td>
                    <td className={isOverdue(task) ? 'text-overdue' : ''}>
                      {formatDate(task.dueDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
