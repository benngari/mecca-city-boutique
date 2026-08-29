import AdminSidebar from '@/components/admin/AdminSidebar';

export const metadata = { robots: { index: false, follow: false } };

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-navy-50 md:flex-row">
      <AdminSidebar />
      <div className="flex-1 p-5 md:p-10">{children}</div>
    </div>
  );
}
