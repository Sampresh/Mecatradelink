import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function PageHeader({ eyebrow, title, description, crumbs = [], children }) {
  return (
    <section className="relative overflow-hidden border-b border-border pt-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgb(var(--primary)/0.12),transparent_60%)]" />
      <div className="container-page relative py-8 sm:py-16">
        {crumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex flex-wrap items-center gap-1 text-xs text-muted">
              <li><Link href="/" className="hover:text-foreground">Home</Link></li>
              {crumbs.map((c) => (
                <li key={c.label} className="flex items-center gap-1">
                  <ChevronRight className="h-3 w-3" aria-hidden />
                  {c.href ? <Link href={c.href} className="hover:text-foreground">{c.label}</Link> : <span className="text-zinc-300">{c.label}</span>}
                </li>
              ))}
            </ol>
          </nav>
        )}
        {eyebrow && <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary sm:mb-2 sm:text-sm">{eyebrow}</p>}
        <h1 className="text-[28px] font-bold leading-tight tracking-tight sm:text-5xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-muted sm:mt-4 sm:text-lg">{description}</p>}
        {children}
      </div>
    </section>
  );
}
