'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ClipboardList, UserCog } from 'lucide-react';
import { ProtectedRoute } from '@/components/common/RouteGuard';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

const LINKS = [
  { href: '/account', label: 'Profile', icon: UserCog, exact: true },
  { href: '/account/quotes', label: 'My requests', icon: ClipboardList },
];

export default function AccountShell({ children }) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);

  return (
    <ProtectedRoute>
      <div className="container-page pb-20 pt-28">
        <div className="mb-8">
          <p className="text-sm text-muted">My account</p>
          <h1 className="text-3xl font-bold tracking-tight">Hello, {user?.name.split(' ')[0]}</h1>
        </div>
        <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
          <nav className="flex gap-2 overflow-x-auto lg:flex-col" aria-label="Account">
            {LINKS.map(({ href, label, icon: Icon, exact }) => {
              const active = exact ? pathname === href : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    active ? 'bg-primary/10 text-primary' : 'text-zinc-300 hover:bg-surface-2',
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden /> {label}
                </Link>
              );
            })}
          </nav>
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
