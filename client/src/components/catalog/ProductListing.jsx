import Link from 'next/link';
import { Search, PackageSearch } from 'lucide-react';
import { ProductGrid } from './ProductCard';
import Pagination from '@/components/common/Pagination';
import { buttonClasses } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Server component: filters are plain links/GET form so listing pages stay crawlable.
export default function ProductListing({ products, meta, categories, activeCategory, q, basePath }) {
  const hrefFor = (params) => {
    const sp = new URLSearchParams();
    if (params.q) sp.set('q', params.q);
    if (params.page > 1) sp.set('page', params.page);
    const qs = sp.toString();
    return `${params.base ?? basePath}${qs ? `?${qs}` : ''}`;
  };

  const chip = (active) =>
    cn(
      'whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors',
      active ? 'border-primary bg-primary/10 text-primary' : 'border-border text-zinc-300 hover:border-primary/40',
    );

  return (
    <div className="container-page py-10">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-wrap lg:px-0">
          <Link href={hrefFor({ q, base: '/products' })} className={chip(!activeCategory)}>All</Link>
          {categories.map((c) => (
            <Link key={c.id} href={hrefFor({ q, base: `/categories/${c.slug}` })} className={chip(activeCategory === c.slug)}>
              {c.name}
            </Link>
          ))}
        </div>

        <form action={basePath} method="get" role="search" className="flex w-full gap-2 lg:w-80">
          <label htmlFor="product-search" className="sr-only">Search products</label>
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
            <input
              id="product-search"
              name="q"
              defaultValue={q}
              placeholder="Search switches, cables, MCB…"
              className="h-11 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-sm placeholder:text-muted/70 focus:border-primary/70 focus:outline-none"
            />
          </div>
          <button type="submit" className={buttonClasses({ size: 'md', variant: 'secondary' })}>Search</button>
        </form>
      </div>

      {q && (
        <p className="mb-6 text-sm text-muted">
          {meta?.total ?? 0} result{meta?.total === 1 ? '' : 's'} for <span className="text-foreground">“{q}”</span>{' '}
          <Link href={basePath} className="text-primary hover:underline">Clear</Link>
        </p>
      )}

      {products.length ? (
        <ProductGrid products={products} />
      ) : (
        <div className="flex flex-col items-center rounded-lg border border-dashed border-border py-20 text-center">
          <PackageSearch className="mb-4 h-10 w-10 text-muted" aria-hidden />
          <h2 className="text-lg font-semibold">No products found</h2>
          <p className="mt-1 max-w-sm text-sm text-muted">
            Can&apos;t find what you need? We stock far more than is listed online. Send us a request.
          </p>
          <Link href="/contact" className={buttonClasses({ className: 'mt-6' })}>Ask our team</Link>
        </div>
      )}

      <Pagination page={meta?.page ?? 1} totalPages={meta?.totalPages} hrefFor={(page) => hrefFor({ q, page })} />
    </div>
  );
}
