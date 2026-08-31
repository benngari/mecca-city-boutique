'use client';

import { useEffect, useState } from 'react';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  async function loadUsers() {
    setLoading(true);
    const res = await fetch('/api/users');
    const data = await res.json();
    setUsers(data.users || []);
    setLoading(false);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleToggleActive(id, nextValue) {
    setBusyId(id);
    const res = await fetch(`/api/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: nextValue }),
    });
    const data = await res.json();

    if (!res.ok) {
      alert(data.error || 'Could not update user.');
    } else {
      setUsers((prev) => prev.map((u) => (u._id === id ? data.user : u)));
    }
    setBusyId(null);
  }

  async function handleResetPassword(id) {
    const newPassword = prompt('Enter a new password for this user (min 8 characters):');
    if (!newPassword) return;

    setBusyId(id);
    const res = await fetch(`/api/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPassword }),
    });
    const data = await res.json();

    if (!res.ok) {
      alert(data.error || 'Could not reset password.');
    } else {
      alert('Password reset successfully.');
    }
    setBusyId(null);
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy dark:text-cream">User Management</h1>
      <p className="mt-1 text-sm text-navy-400 dark:text-navy-300">
        New signups from /admin/signup arrive here inactive. Activate them below before they can
        sign in.
      </p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-navy-100 bg-white dark:border-navy-700 dark:bg-navy-800">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-navy-100 text-left text-xs uppercase tracking-wide text-navy-400 dark:border-navy-700 dark:text-navy-300">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-navy-300 dark:text-navy-400">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-navy-300 dark:text-navy-400">
                  No admin accounts found.
                </td>
              </tr>
            )}
            {users.map((u) => (
              <tr key={u._id} className="border-b border-navy-50 last:border-0 dark:border-navy-700">
                <td className="px-4 py-3 text-navy dark:text-cream">{u.name}</td>
                <td className="px-4 py-3 text-navy-500 dark:text-navy-200">{u.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      u.isActive ? 'bg-emerald/10 text-emerald' : 'bg-gold/20 text-gold'
                    }`}
                  >
                    {u.isActive ? 'Active' : 'Pending'}
                  </span>
                </td>
                <td className="px-4 py-3 text-navy-500 dark:text-navy-200">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => handleToggleActive(u._id, !u.isActive)}
                      disabled={busyId === u._id}
                      className={`font-semibold disabled:opacity-50 ${
                        u.isActive ? 'text-red-500' : 'text-emerald'
                      }`}
                    >
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleResetPassword(u._id)}
                      disabled={busyId === u._id}
                      className="font-semibold text-electric disabled:opacity-50"
                    >
                      Reset Password
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
