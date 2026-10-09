import PageHeader from '@/components/common/PageHeader';
import GalleryGrid from '@/components/gallery/GalleryGrid';
import { serverFetch } from '@/lib/serverApi';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Gallery',
  description: 'Photos of the Meca Trade Link showroom in Madhyapur Thimi, our stock, products and electrical project installations.',
  path: '/gallery',
});

export default async function GalleryPage() {
  const res = await serverFetch('/gallery', { revalidate: 120, fallback: [] });
  return (
    <>
      <PageHeader
        eyebrow="Gallery"
        title="Our showroom, stock & projects"
        description="A look inside our store and warehouse, and at installations completed with our products."
        crumbs={[{ label: 'Gallery' }]}
      />
      <section className="container-page py-12">
        <GalleryGrid images={res.data} />
      </section>
    </>
  );
}
