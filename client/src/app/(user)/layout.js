import AccountShell from '@/components/user/AccountShell';
import ShowcaseNotice from '@/components/common/ShowcaseNotice';
import { STATIC_MODE } from '@/lib/mode';

export const metadata = { robots: { index: false, follow: false } };

export default function UserLayout({ children }) {
  if (STATIC_MODE) return <ShowcaseNotice />;
  return <AccountShell>{children}</AccountShell>;
}
