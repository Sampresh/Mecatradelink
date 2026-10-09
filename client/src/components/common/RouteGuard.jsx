'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

function FullPageSpinner() {
  return (
    <div className="grid min-h-[60vh] place-items-center" role="status" aria-label="Loading">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

function Guard({ allow, redirectTo, children }) {
  const { user, status } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const ready = status === 'ready';
  const permitted = ready && user && allow(user);

  useEffect(() => {
    if (!ready || permitted) return;
    router.replace(user ? redirectTo : `/login?next=${encodeURIComponent(pathname)}`);
  }, [ready, permitted, user, router, pathname, redirectTo]);

  return permitted ? children : <FullPageSpinner />;
}

export const ProtectedRoute = ({ children }) => (
  <Guard allow={() => true} redirectTo="/">{children}</Guard>
);

// UX only — the API enforces admin access on every route.
export const AdminRoute = ({ children }) => (
  <Guard allow={(u) => u.role === 'ADMIN'} redirectTo="/account">{children}</Guard>
);

// Sends signed-in users away from login/register.
export function GuestOnly({ children }) {
  const { user, status } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (status === 'ready' && user) router.replace(user.role === 'ADMIN' ? '/admin' : '/account');
  }, [status, user, router]);

  // Render the form immediately (server-rendered, no spinner flash); only signed-in users
  // are redirected once the session check completes.
  if (user) return <FullPageSpinner />;
  return children;
}
