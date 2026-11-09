'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/components/admin/useToast';
import { useAdminSession } from '@/components/admin/AdminSessionContext';

export default function UsersPage() {
  const session = useAdminSession();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [resetTarget, setResetTarget] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const { showToast, ToastDisplay } = useToast();

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

  // Returns true when the change was saved.
  async function patchUser(id, payload, successMessage) {
    setBusyId(id);
    let ok = false;
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || 'Could not update user.', 'error');
      } else {
        setUsers((prev) => prev.map((u) => (u._id === id ? data.user : u)));
        showToast(successMessage);
        ok = true;
      }
    } catch {
      showToast('Something went wrong. Try again.', 'error');
    }
    setBusyId(null);
    return ok;
  }

  function handleToggleActive(id, nextValue) {
    return patchUser(id, { isActive: nextValue }, nextValue ? 'User activated.' : 'User deactivated.');
  }

  function handleChangeRole(id, role) {
    return patchUser(id, { role }, `Role changed to ${role}.`);
  }

  function openResetModal(user) {
    setResetTarget(user);
    setNewPassword('');
    setResetError('');
  }

  function closeResetModal() {
    setResetTarget(null);
    setNewPassword('');
    setResetError('');
  }

  async function submitReset(e) {
    e.preventDefault();
    if (newPassword.length < 8) {
      setResetError('Password must be at least 8 characters.');
      return;
    }
    const ok = await patchUser(resetTarget._id, { newPassword }, `Password reset for ${resetTarget.name}.`);
    if (ok) closeResetModal();
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy dark:text-cream">User Management</h1>
      <p className="mt-1 text-sm text-navy-400 dark:text-navy-300">
        New signups arrive inactive. Check the role they asked for, then activate. Staff can only
        record sales; owners have full access.
      </p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-navy-100 bg-white dark:border-navy-700 dark:bg-navy-800">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-navy-100 text-left text-xs uppercase tracking-wide text-navy-400 dark:border-navy-700 dark:text-navy-300">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-navy-300 dark:text-navy-400">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-navy-300 dark:text-navy-400">
                  No admin accounts found.
                </td>
              </tr>
            )}
            {users.map((u) => {
              const isSelf = u.email === session?.email;
              const pendingOwner = !u.isActive && u.role === 'owner';
              return (
                <tr key={u._id} className="border-b border-navy-50 last:border-0 dark:border-navy-700">
                  <td className="px-4 py-3 text-navy dark:text-cream">{u.name}</td>
                  <td className="px-4 py-3 text-navy-500 dark:text-navy-200">{u.email}</td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role || 'staff'}
                      disabled={isSelf || busyId === u._id}
                      onChange={(e) => handleChangeRole(u._id, e.target.value)}
                      className="rounded-lg border border-navy-200 px-2 py-1.5 text-xs font-semibold focus:border-electric focus:outline-none disabled:opacity-60 dark:border-navy-600 dark:bg-navy-900 dark:text-cream"
                    >
                      <option value="staff">Staff</option>
                      <option value="owner">Owner</option>
                    </select>
                    {pendingOwner && (
                      <p className="mt-1 text-[11px] font-semibold text-red-500">
                        Asked for OWNER access - check before activating
                      </p>
                    )}
                  </td>
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
                      {!isSelf && (
                        <button
                          onClick={() => handleToggleActive(u._id, !u.isActive)}
                          disabled={busyId === u._id}
                          className={`font-semibold disabled:opacity-50 ${
                            u.isActive ? 'text-red-500' : 'text-emerald'
                          }`}
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                      <button
                        onClick={() => openResetModal(u)}
                        disabled={busyId === u._id}
                        className="font-semibold text-electric disabled:opacity-50"
                      >
                        Reset Password
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {resetTarget && (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 p-4"
          onClick={closeResetModal}
        >
          <form
            onSubmit={submitReset}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-navy-800"
          >
            <p className="font-display text-lg font-bold text-navy dark:text-cream">Reset password</p>
            <p className="mt-1 text-sm text-navy-500 dark:text-navy-200">
              Set a new password for{' '}
              <span className="font-semibold text-navy dark:text-cream">{resetTarget.name}</span> (
              {resetTarget.email}).
            </p>

            <label className="mt-4 block text-sm font-semibold text-navy dark:text-cream">
              New password
              <input
                type="password"
                autoFocus
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setResetError('');
                }}
                className="mt-1 w-full rounded-lg border border-navy-200 px-3 py-2.5 text-sm focus:border-electric focus:outline-none dark:border-navy-600 dark:bg-navy-900 dark:text-cream"
              />
            </label>
            <p className="mt-1 text-xs text-navy-400 dark:text-navy-300">
              At least 8 characters. Share it with them privately.
            </p>

            {resetError && (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{resetError}</p>
            )}

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeResetModal}
                className="rounded-full border border-navy-200 px-4 py-2 text-sm font-semibold text-navy dark:border-navy-600 dark:text-cream"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busyId === resetTarget._id}
                className="rounded-full bg-navy px-4 py-2 text-sm font-semibold text-cream hover:bg-electric disabled:opacity-60"
              >
                {busyId === resetTarget._id ? 'Saving...' : 'Reset Password'}
              </button>
            </div>
          </form>
        </div>
      )}

      {ToastDisplay}
    </div>
  );
}
