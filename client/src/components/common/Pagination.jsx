import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// Server-friendly pagination built from links (works without JS, crawlable).
export default function Pagination({ page, totalPages, hrefFor }) {
  if (!totalPages || totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
  );

  const item = 'grid h-10 min-w-10 place-items-center rounded-lg border px-3 text-sm transition-colors';
  return (
    <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-2">
      {page > 1 && (
        <Link href={hrefFor(page - 1)} className={cn(item, 'border-border hover:border-primary/50')} aria-label="Previous page">
          <ChevronLeft className="h-4 w-4" />
        </Link>
      )}
      {pages.map((p, i) => (
        <span key={p} className="flex items-center gap-2">
          {i > 0 && p - pages[i - 1] > 1 && <span className="text-muted">…</span>}
          <Link
            href={hrefFor(p)}
            aria-current={p === page ? 'page' : undefined}
            className={cn(item, p === page ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/50')}
          >
            {p}
          </Link>
        </span>
      ))}
      {page < totalPages && (
        <Link href={hrefFor(page + 1)} className={cn(item, 'border-border hover:border-primary/50')} aria-label="Next page">
          <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </nav>
  );
}
