'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import { authApi } from '../../lib/api';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/feed';

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await authApi.register(username, email, password);
      router.push(redirectUrl);
    } catch (err) {
      setError(err.message || 'Registration failed. Please check the entered details.');
    } finally {
      setLoading(false);
    }
  };

  const loginHref = redirectUrl && redirectUrl !== '/feed'
    ? `/login?redirect=${encodeURIComponent(redirectUrl)}`
    : '/login';

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Create an Account</h1>
          <p className="auth-subtitle">
            Join FounderTruth to curate, bookmark, and track essential founder knowledge.
          </p>
        </div>

        {error && (
          <div className="alert alert-error">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">
              Username <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>(optional)</span>
            </label>
            <input
              id="username"
              type="text"
              className="form-input"
              placeholder="e.g. alex_founder"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="founder@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>(min 6 characters)</span>
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-block"
            style={{ marginTop: '12px', padding: '11px' }}
          >
            {loading ? 'Creating Account...' : 'Get Started'}
          </button>
        </form>

        <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link href={loginHref} style={{ fontWeight: '600', color: 'var(--accent-primary)' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="auth-container">
        <div className="auth-card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          Loading registration form...
        </div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
