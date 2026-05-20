import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    adminInviteCode: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.password) {
      toast.error('Name, email, and password are required');
      return;
    }

    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setSubmitting(true);
    try {
      await register(
        form.name.trim(),
        form.email.trim(),
        form.password,
        form.adminInviteCode.trim()
      );
      toast.success('Account created');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to create account');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand-mark" aria-hidden="true">E</div>
        <div className="auth-header">
          <h1>Create your workspace login</h1>
          <p>The first account becomes admin. Later admins need an invite code.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="form-group" htmlFor="name">
            Full name
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Prabh Singh"
              value={form.name}
              onChange={handleChange}
              autoComplete="name"
            />
          </label>

          <label className="form-group" htmlFor="reg-email">
            Email
            <input
              id="reg-email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </label>

          <label className="form-group" htmlFor="reg-password">
            Password
            <input
              id="reg-password"
              name="password"
              type="password"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
            />
          </label>

          <label className="form-group" htmlFor="adminInviteCode">
            Admin invite code
            <input
              id="adminInviteCode"
              name="adminInviteCode"
              type="text"
              placeholder="Optional"
              value={form.adminInviteCode}
              onChange={handleChange}
              autoComplete="off"
            />
          </label>

          <button type="submit" className="btn-primary btn-full" disabled={submitting}>
            {submitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="auth-footer">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
}
