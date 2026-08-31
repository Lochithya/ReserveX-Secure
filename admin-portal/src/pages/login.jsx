import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import './Login.css';

const EnvelopeIcon = () => (
  <svg className="login-input-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
    <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
  </svg>
);

const LockIcon = () => (
  <svg className="login-input-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="login-footer-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.75.75 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516 11.209 11.209 0 01-7.877-3.08zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" clipRule="evenodd" />
  </svg>
);

const Spinner = () => (
  <svg className="login-spinner" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const ADMIN_FEATURES = [
  {
    icon: '🏛️',
    title: 'Multi-Event Management',
    desc: 'Configure exhibitions, venues & stall layouts across events',
  },
  {
    icon: '📋',
    title: 'Reservation Oversight',
    desc: 'Review and manage vendor bookings in one place',
  },
  {
    icon: '📊',
    title: 'Real-Time Analytics',
    desc: 'Monitor stall occupancy and reservation trends',
  },
];

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(credentials.email, credentials.password);

      if (success) {
        navigate('/dashboard');
      } else {
        setError('Invalid email or password. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <aside className="login-brand-panel" aria-label="ReserveX admin platform overview">
        <div className="login-brand-orb-top" />
        <div className="login-brand-orb-bottom" />

        <div className="login-brand-content">
          <div className="login-brand-logo">
            <span>RX</span>
          </div>
          <h1 className="login-brand-title">ReserveX</h1>
          <p className="login-brand-tagline">Stall Reservation Platform</p>

          <div className="login-feature-list">
            {ADMIN_FEATURES.map((item) => (
              <div key={item.title} className="login-feature-card">
                <span className="login-feature-icon" aria-hidden="true">{item.icon}</span>
                <div>
                  <p className="login-feature-title">{item.title}</p>
                  <p className="login-feature-desc">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <main className="login-auth-panel">
        <div className="login-auth-inner">
          <div className="login-mobile-brand">
            <div className="login-mobile-logo">
              <span>RX</span>
            </div>
            <h1 className="login-mobile-title">ReserveX</h1>
          </div>

          <div className="login-card">
            <div className="login-card-body">
              <span className="login-admin-badge">Admin Console</span>
              <h2 className="login-card-heading">Welcome back</h2>
              <p className="login-card-subheading">
                Sign in to manage exhibitions, stalls, and reservations across events
              </p>

              {error && (
                <div className="login-error" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="login-form">
                <div className="login-field">
                  <label htmlFor="admin-email">Email Address</label>
                  <div className="login-input-wrap">
                    <EnvelopeIcon />
                    <input
                      id="admin-email"
                      type="email"
                      name="email"
                      value={credentials.email}
                      onChange={handleChange}
                      className="login-input"
                      required
                      autoComplete="email"
                      placeholder="admin@example.com"
                    />
                  </div>
                </div>

                <div className="login-field">
                  <label htmlFor="admin-password">Password</label>
                  <div className="login-input-wrap">
                    <LockIcon />
                    <input
                      id="admin-password"
                      type="password"
                      name="password"
                      value={credentials.password}
                      onChange={handleChange}
                      className="login-input"
                      required
                      autoComplete="current-password"
                      placeholder="Enter your password"
                    />
                  </div>
                </div>

                <button type="submit" className="login-submit" disabled={loading}>
                  {loading ? (
                    <span className="login-submit-content">
                      <Spinner />
                      Signing in...
                    </span>
                  ) : (
                    'Sign In to Admin Console'
                  )}
                </button>
              </form>

              <div className="login-footer">
                <ShieldIcon />
                <span className="login-footer-text">JWT Secured Admin Console</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
