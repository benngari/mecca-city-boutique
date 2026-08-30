import AdminSidebar from '@/components/admin/AdminSidebar';

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-navy-50 md:flex-row">
      <AdminSidebar />
      <div className="flex-1 p-5 md:p-10">{children}</div>
    </div>
  );
}
