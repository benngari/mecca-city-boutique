import AdminSidebar from '@/components/admin/AdminSidebar';
import { getSession } from '@/lib/auth';

export default async function DashboardLayout({ children }) {
  const session = await getSession();

  return (
    <div className="flex min-h-screen flex-col bg-navy-50 dark:bg-navy-900 md:flex-row">
      <AdminSidebar />
      <div className="flex-1 p-5 md:p-10">
        {session?.name && (
          <p className="mb-4 text-sm text-navy-500 dark:text-navy-300">
            Welcome, <span className="font-semibold text-navy dark:text-cream">{session.name}</span>{' '}
            <span className="text-navy-300 dark:text-navy-400">({session.email})</span>
          </p>
        )}
        {children}
      </div>
    </div>
  );
}