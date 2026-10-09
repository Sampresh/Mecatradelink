import PageHeader from '@/components/common/PageHeader';
import ProductListing from '@/components/catalog/ProductListing';
import { serverFetch } from '@/lib/serverApi';
import { buildMetadata } from '@/lib/seo';

export async function generateMetadata(props) {
  const searchParams = await props.searchParams;
  const page = Math.max(Number(searchParams.page) || 1, 1);
  return buildMetadata({
    title: `Electrical Products Catalogue${page > 1 ? ` – Page ${page}` : ''}`,
    description: 'Browse switches, sockets, wires and cables, LED lighting, MCBs, distribution boards, accessories and electrical tools.',
    path: page > 1 ? `/products?page=${page}` : '/products',
  });
}

export default async function ProductsPage(props) {
  const searchParams = await props.searchParams;
  const q = typeof searchParams.q === 'string' ? searchParams.q.slice(0, 100) : '';
  const page = Math.max(Number(searchParams.page) || 1, 1);
  const qs = new URLSearchParams({ page, limit: 16, ...(q && { q }) });

  const [products, categories] = await Promise.all([
    serverFetch(`/products?${qs}`, { revalidate: 60 }),
    serverFetch('/categories', { revalidate: 300, fallback: [] }),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Catalogue"
        title="Electrical products"
        description="Add items to your quote list and our sales team will price the whole order."
        crumbs={[{ label: 'Products' }]}
      />
      <ProductListing
        products={products?.data ?? []}
        meta={products?.meta}
        categories={categories.data}
        q={q}
        basePath="/products"
      />
    </>
  );
}
