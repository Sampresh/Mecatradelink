import { connection } from 'next/server';
import AetherFlowHero from '@/components/ui/aether-flow-hero';
import {
  ContactStrip, CategoriesSection, FeaturedSection, WhyChooseUs, BrandsSection, AudienceSection, FocusSection,
  GalleryTeaser, CtaBand,
} from '@/components/home/HomeSections';
import { serverFetch } from '@/lib/serverApi';
import { buildMetadata } from '@/lib/seo';

export const metadata = {
  ...buildMetadata({ path: '/' }),
  title: { absolute: 'Meca Trade Link | Electrical Products & Materials Supplier, Madhyapur Thimi' },
};

export default async function HomePage() {
  // Render per request (the API is unreachable during `next build`, e.g. in Docker);
  // the API responses themselves stay cached via serverFetch.
  await connection();
  const [categories, featured, brands, gallery] = await Promise.all([
    serverFetch('/categories', { revalidate: 300, fallback: [] }),
    serverFetch('/products?featured=true&limit=8', { revalidate: 300, fallback: [] }),
    serverFetch('/brands', { revalidate: 300, fallback: [] }),
    serverFetch('/gallery', { revalidate: 300, fallback: [] }),
  ]);

  return (
    <>
      <AetherFlowHero
        secondaryCta={{ href: '/contact', label: 'Contact Us' }}
      />
      <ContactStrip />
      <FeaturedSection products={featured?.data ?? []} />
      <CategoriesSection categories={categories?.data ?? []} />
      <WhyChooseUs />
      <BrandsSection brands={brands?.data ?? []} />
      <AudienceSection />
      <FocusSection />
      <GalleryTeaser images={gallery?.data ?? []} />
      <CtaBand />
    </>
  );
}
