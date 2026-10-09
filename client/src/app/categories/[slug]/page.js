import { notFound } from 'next/navigation';
import PageHeader from '@/components/common/PageHeader';
import ProductListing from '@/components/catalog/ProductListing';
import { serverFetch } from '@/lib/serverApi';
import { buildMetadata } from '@/lib/seo';

export async function generateMetadata(props) {
  const [params, searchParams] = await Promise.all([props.params, props.searchParams]);
  const page = Math.max(Number(searchParams.page) || 1, 1);
  const res = await serverFetch(`/categories/${params.slug}`, { revalidate: 300 });
  if (!res) return {};
  return buildMetadata({
    title: `${res.data.name}${page > 1 ? ` – Page ${page}` : ''}`,
    description: res.data.description || `Shop ${res.data.name} from Meca Trade Link, your electrical products supplier.`,
    path: `/categories/${params.slug}${page > 1 ? `?page=${page}` : ''}`,
  });
}

export default async function CategoryPage(props) {
  const [params, searchParams] = await Promise.all([props.params, props.searchParams]);
  const q = typeof searchParams.q === 'string' ? searchParams.q.slice(0, 100) : '';
  const page = Math.max(Number(searchParams.page) || 1, 1);
  const qs = new URLSearchParams({ page, limit: 16, category: params.slug, ...(q && { q }) });

  const [category, products, categories] = await Promise.all([
    serverFetch(`/categories/${params.slug}`, { revalidate: 300 }),
    serverFetch(`/products?${qs}`, { revalidate: 60 }),
    serverFetch('/categories', { revalidate: 300, fallback: [] }),
  ]);
  if (!category) notFound();

  return (
    <>
      <PageHeader
        eyebrow="Category"
        title={category.data.name}
        description={category.data.description}
        crumbs={[{ label: 'Products', href: '/products' }, { label: category.data.name }]}
      />
      <ProductListing
        products={products?.data ?? []}
        meta={products?.meta}
        categories={categories.data}
        activeCategory={params.slug}
        q={q}
        basePath={`/categories/${params.slug}`}
      />
    </>
  );
}
