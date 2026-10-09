import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ExternalLink, PackageSearch } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import BrandLogo from '@/components/catalog/BrandLogo';
import { ProductGrid } from '@/components/catalog/ProductCard';
import Pagination from '@/components/common/Pagination';
import { ButtonLink } from '@/components/ui/button';
import { serverFetch } from '@/lib/serverApi';
import { buildMetadata } from '@/lib/seo';

export async function generateMetadata(props) {
  const params = await props.params;
  const res = await serverFetch(`/brands/${params.slug}`, { revalidate: 300 });
  if (!res) return {};
  return buildMetadata({
    title: `${res.data.name} Products`,
    description: res.data.description || `${res.data.name} electrical products available at Meca Trade Link, Madhyapur Thimi.`,
    path: `/brands/${params.slug}`,
    image: res.data.logoUrl,
  });
}

export default async function BrandPage(props) {
  const [params, searchParams] = await Promise.all([props.params, props.searchParams]);
  const page = Math.max(Number(searchParams.page) || 1, 1);
  const [brandRes, products] = await Promise.all([
    serverFetch(`/brands/${params.slug}`, { revalidate: 300 }),
    serverFetch(`/products?${new URLSearchParams({ brand: params.slug, page, limit: 16 })}`, { revalidate: 60 }),
  ]);
  if (!brandRes) notFound();
  const brand = brandRes.data;

  return (
    <>
      <PageHeader title={brand.name} description={brand.description} crumbs={[{ label: 'Brands', href: '/brands' }, { label: brand.name }]}>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <BrandLogo brand={brand} size="lg" className="w-48" />
          <div className="space-y-2">
            {brand.categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {brand.categories.map((c) => (
                  <Link key={c.id} href={`/categories/${c.slug}`} className="rounded-full border border-border px-3 py-1 text-xs text-zinc-300 hover:border-primary/50">
                    {c.name}
                  </Link>
                ))}
              </div>
            )}
            {brand.website && (
              <a href={brand.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                Official website <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </a>
            )}
          </div>
        </div>
      </PageHeader>
      <section className="container-page py-10">
        {products?.data.length ? (
          <>
            <ProductGrid products={products.data} />
            <Pagination page={products.meta.page} totalPages={products.meta.totalPages} hrefFor={(p) => `/brands/${brand.slug}${p > 1 ? `?page=${p}` : ''}`} />
          </>
        ) : (
          <div className="flex flex-col items-center rounded-lg border border-dashed border-border py-16 text-center">
            <PackageSearch className="mb-4 h-10 w-10 text-muted" aria-hidden />
            <h2 className="text-lg font-semibold">{brand.name} products are being added</h2>
            <p className="mt-1 max-w-sm text-sm text-muted">We supply the {brand.name} range. Ask us for the item you need.</p>
            <ButtonLink href="/contact" className="mt-6">Enquire about {brand.name}</ButtonLink>
          </div>
        )}
      </section>
    </>
  );
}
