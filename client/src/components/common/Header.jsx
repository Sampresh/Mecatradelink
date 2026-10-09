'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ClipboardList, LayoutDashboard, LogOut, Menu, User, X } from 'lucide-react';
import Logo from './Logo';
import { ButtonLink } from '@/components/ui/button';
import { nav } from '@/lib/site';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { useQuoteList } from '@/hooks/useQuoteList';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  // The mobile menu remembers the path it was opened on, so navigating closes it.
  const [menuPath, setMenuPath] = useState(null);
  const open = menuPath === pathname;
  const { user, logout } = useAuthStore();
  const { count } = useQuoteList();
  const overHero = pathname === '/' && !scrolled && !open;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const isActive = (href) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-colors duration-300',
        overHero ? 'bg-transparent' : 'border-b border-border/70 bg-background/85 backdrop-blur-md',
      )}
    >
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive(item.href) ? 'text-primary' : 'text-zinc-300 hover:text-foreground',
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/quote"
            className="relative inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-zinc-300 hover:bg-surface-2 hover:text-foreground"
            aria-label={`Quote list, ${count} item${count === 1 ? '' : 's'}`}
          >
            <ClipboardList className="h-5 w-5" aria-hidden />
            <span className="hidden lg:inline">Quote list</span>
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground lg:static">
                {count}
              </span>
            )}
          </Link>

          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <>
                {user.role === 'ADMIN' && (
                  <ButtonLink href="/admin" variant="ghost" size="sm">
                    <LayoutDashboard className="h-4 w-4" aria-hidden /> Admin
                  </ButtonLink>
                )}
                <ButtonLink href="/account" variant="ghost" size="sm">
                  <User className="h-4 w-4" aria-hidden /> {user.name.split(' ')[0]}
                </ButtonLink>
                <button onClick={handleLogout} className="rounded-lg p-2 text-muted hover:bg-surface-2 hover:text-foreground" aria-label="Log out">
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <ButtonLink href="/login" variant="ghost" size="sm">Log in</ButtonLink>
                <ButtonLink href="/quote" size="sm">Get a Quote</ButtonLink>
              </>
            )}
          </div>

          <button
            className="rounded-lg p-2 text-zinc-300 hover:bg-surface-2 md:hidden"
            onClick={() => setMenuPath(open ? null : pathname)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="container-page flex flex-col gap-1 py-4" aria-label="Mobile">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-lg px-3 py-3 font-medium text-zinc-200 hover:bg-surface-2">
                {item.label}
              </Link>
            ))}
            <div className="my-2 h-px bg-border" />
            {user ? (
              <>
                {user.role === 'ADMIN' && <Link href="/admin" className="rounded-lg px-3 py-3 text-zinc-200 hover:bg-surface-2">Admin dashboard</Link>}
                <Link href="/account" className="rounded-lg px-3 py-3 text-zinc-200 hover:bg-surface-2">My account</Link>
                <button onClick={handleLogout} className="rounded-lg px-3 py-3 text-left text-zinc-200 hover:bg-surface-2">Log out</button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <ButtonLink href="/login" variant="outline">Log in</ButtonLink>
                <ButtonLink href="/register">Create account</ButtonLink>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
