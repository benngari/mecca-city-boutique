'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AdminSignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Signup failed');
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError('Something went wrong. Try again.');
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-900 px-5">
        <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-xl">
          <p className="font-display text-2xl font-bold text-navy">Account created</p>
          <p className="mt-3 text-sm text-navy-500">
            An existing admin needs to activate your account in User Management before you can
            sign in.
          </p>
          <Link href="/admin/login" className="mt-6 inline-block text-sm font-semibold text-electric">
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-900 px-5">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <p className="font-display text-2xl font-bold text-navy">Request Admin Access</p>
        <p className="mt-1 text-sm text-navy-400">Mecca City Boutique</p>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        <label className="mt-6 block text-sm font-semibold text-navy">
          Full Name
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-navy-200 px-3 py-2.5 text-sm focus:border-electric focus:outline-none"
          />
        </label>

        <label className="mt-4 block text-sm font-semibold text-navy">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-navy-200 px-3 py-2.5 text-sm focus:border-electric focus:outline-none"
          />
        </label>

        <label className="mt-4 block text-sm font-semibold text-navy">
          Password
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-navy-200 px-3 py-2.5 text-sm focus:border-electric focus:outline-none"
          />
          <span className="mt-1 block text-xs font-normal text-navy-400">At least 8 characters.</span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-full bg-navy py-3 text-sm font-semibold text-cream hover:bg-electric disabled:opacity-60"
        >
          {loading ? 'Submitting...' : 'Request Access'}
        </button>

        <Link href="/admin/login" className="mt-4 block text-center text-xs font-semibold text-navy-400 hover:text-electric">
          Already have an account? Sign in
        </Link>
      </form>
    </div>
  );
}
