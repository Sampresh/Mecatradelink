'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Award, ExternalLink, FolderTree, Images, Inbox, LayoutDashboard, LogOut, Menu, Package, X } from 'lucide-react';
import Logo from '@/components/common/Logo';
import { AdminRoute } from '@/components/common/RouteGuard';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

const LINKS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/enquiries', label: 'Enquiries', icon: Inbox },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: FolderTree },
  { href: '/admin/brands', label: 'Brands', icon: Award },
  { href: '/admin/gallery', label: 'Gallery', icon: Images },
];

export default function AdminShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b border-border px-5"><Logo href="/admin" /></div>
      <nav className="flex-1 space-y-1 p-3" aria-label="Admin">
        {LINKS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active ? 'bg-primary/10 text-primary' : 'text-zinc-300 hover:bg-surface-2',
              )}
            >
              <Icon className="h-4 w-4" aria-hidden /> {label}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-1 border-t border-border p-3">
        <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted hover:bg-surface-2 hover:text-foreground">
          <ExternalLink className="h-4 w-4" aria-hidden /> View website
        </Link>
        <button
          onClick={async () => { await logout(); router.push('/login'); }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted hover:bg-surface-2 hover:text-foreground"
        >
          <LogOut className="h-4 w-4" aria-hidden /> Log out
        </button>
        {user && <p className="truncate px-3 pt-2 text-xs text-zinc-500">{user.email}</p>}
      </div>
    </div>
  );

  return (
    <AdminRoute>
      <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
        <aside className="sticky top-0 hidden h-screen border-r border-border bg-surface/50 lg:block">{sidebar}</aside>

        <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur lg:hidden">
          <Logo href="/admin" />
          <button onClick={() => setOpen(true)} className="rounded-lg p-2 hover:bg-surface-2" aria-label="Open menu"><Menu className="h-5 w-5" /></button>
        </div>
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
            <aside className="absolute inset-y-0 left-0 w-72 border-r border-border bg-background">
              <button onClick={() => setOpen(false)} className="absolute right-3 top-4 rounded-lg p-2 hover:bg-surface-2" aria-label="Close menu"><X className="h-5 w-5" /></button>
              {sidebar}
            </aside>
          </div>
        )}

        <main className="min-w-0 p-4 sm:p-8">{children}</main>
      </div>
    </AdminRoute>
  );
}
