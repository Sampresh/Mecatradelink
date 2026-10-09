import AccountShell from '@/components/user/AccountShell';

export const metadata = { robots: { index: false, follow: false } };

export default function UserLayout({ children }) {
  return <AccountShell>{children}</AccountShell>;
}
