import { Award } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import BrandCard from '@/components/brands/BrandCard';
import { ButtonLink } from '@/components/ui/button';
import { serverFetch } from '@/lib/serverApi';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Our Brands',
  description: 'Electrical brands supplied by Meca Trade Link: switches, lighting, cables, circuit protection and more.',
  path: '/brands',
});

export default async function BrandsPage() {
  const res = await serverFetch('/brands', { revalidate: 300, fallback: [] });
  const brands = res.data;

  return (
    <>
      <PageHeader
        eyebrow="Brands we deal with"
        title="Trusted brands, genuine products"
        description="We source from established manufacturers and authorised distributors. Choose a brand to see the products we stock."
        crumbs={[{ label: 'Brands' }]}
      />
      <section className="container-page py-12">
        {brands.length ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {brands.map((b) => <BrandCard key={b.id} brand={b} />)}
          </div>
        ) : (
          <div className="flex flex-col items-center rounded-lg border border-dashed border-border py-20 text-center">
            <Award className="mb-4 h-10 w-10 text-muted" aria-hidden />
            <h2 className="text-lg font-semibold">Brand list coming soon</h2>
            <p className="mt-1 max-w-sm text-sm text-muted">Ask us about a specific brand. We probably stock it or can source it.</p>
            <ButtonLink href="/contact" className="mt-6">Ask about a brand</ButtonLink>
          </div>
        )}
      </section>
    </>
  );
}
