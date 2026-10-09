import AdminShell from '@/components/admin/AdminShell';
import ShowcaseNotice from '@/components/common/ShowcaseNotice';
import { STATIC_MODE } from '@/lib/mode';

export const metadata = { title: 'Admin', robots: { index: false, follow: false } };

export default function AdminLayout({ children }) {
  // The admin panel needs the API; in showcase mode the content comes from the bundled snapshot.
  if (STATIC_MODE) return <ShowcaseNotice area="Online accounts" />;
  return <AdminShell>{children}</AdminShell>;
}
