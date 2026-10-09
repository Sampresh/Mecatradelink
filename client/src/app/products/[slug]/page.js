import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, Phone, ShieldCheck, Truck, Timer } from 'lucide-react';
import ProductGallery from '@/components/catalog/ProductGallery';
import AddToQuoteButton from '@/components/catalog/AddToQuoteButton';
import EnquireButton from '@/components/catalog/EnquireButton';
import BrandLogo from '@/components/catalog/BrandLogo';
import WhatsAppIcon from '@/components/common/WhatsAppIcon';
import { buttonClasses } from '@/components/ui/button';
import { ProductGrid } from '@/components/catalog/ProductCard';
import { serverFetch } from '@/lib/serverApi';
import { buildMetadata, jsonLdHtml } from '@/lib/seo';
import { productMessage, site, whatsappLink } from '@/lib/site';
import { reveal } from '@/lib/motion';

const getProduct = (slug) => serverFetch(`/products/${slug}`, { revalidate: 120 });

export async function generateMetadata(props) {
  const params = await props.params;
  const res = await getProduct(params.slug);
  if (!res) return {};
  const p = res.data;
  return buildMetadata({
    title: p.name,
    description: p.summary || `${p.name}, available from Meca Trade Link. Request a quote today.`,
    path: `/products/${p.slug}`,
    image: p.imageUrl,
  });
}

export default async function ProductPage(props) {
  const params = await props.params;
  const res = await getProduct(params.slug);
  if (!res) notFound();
  const product = res.data;
  const specs = Array.isArray(product.specs) ? product.specs : [];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.summary,
    sku: product.sku || undefined,
    brand: product.brand ? { '@type': 'Brand', name: product.brand.name } : undefined,
    model: product.model || undefined,
    image: product.images.length ? product.images.map((i) => i.url) : undefined,
    category: product.category.name,
    url: `${site.url}/products/${product.slug}`,
  };

  return (
    <div className="pt-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml(jsonLd)} />
      <div className="container-page py-8">
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex flex-wrap items-center gap-1 text-xs text-muted">
            <li><Link href="/" className="hover:text-foreground">Home</Link></li>
            <li className="flex items-center gap-1"><ChevronRight className="h-3 w-3" aria-hidden /><Link href="/products" className="hover:text-foreground">Products</Link></li>
            <li className="flex items-center gap-1"><ChevronRight className="h-3 w-3" aria-hidden /><Link href={`/categories/${product.category.slug}`} className="hover:text-foreground">{product.category.name}</Link></li>
            <li className="flex items-center gap-1"><ChevronRight className="h-3 w-3" aria-hidden /><span className="text-zinc-300">{product.name}</span></li>
          </ol>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div {...reveal('zoom')}>
            <ProductGallery images={product.images} name={product.name} />
          </div>

          <div {...reveal('soft')}>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Link href={`/categories/${product.category.slug}`} className="text-sm font-medium text-primary hover:underline">{product.category.name}</Link>
              {product.sku && <span className="font-mono text-xs text-muted">SKU {product.sku}</span>}
            </div>
            <h1 className="text-2xl font-bold leading-tight tracking-tight sm:text-4xl">{product.name}</h1>
            {product.model && <p className="mt-2 font-mono text-sm text-zinc-400">Model: {product.model}</p>}
            {product.brand && (
              <Link href={`/brands/${product.brand.slug}`} className="mt-4 inline-flex items-center gap-3 rounded-lg border border-border p-1.5 pr-4 text-sm hover:border-primary/50">
                <BrandLogo brand={product.brand} size="sm" className="w-20" />
                <span>Brand: <span className="font-semibold">{product.brand.name}</span></span>
              </Link>
            )}
            {product.summary && <p className="mt-3 text-base text-muted sm:mt-4 sm:text-lg">{product.summary}</p>}

            <div className="mt-6 rounded-lg border border-border bg-surface p-4 sm:mt-8 sm:p-5">
              <p className="mb-4 text-sm text-muted">
                Prices depend on quantity and requirements. Ask us for today&apos;s price and stock. Sold per{' '}
                <span className="text-foreground">{product.unit}</span>.
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                <EnquireButton product={product} size="lg" label="Get Price / Enquire" className="w-full" />
                <a
                  href={whatsappLink(productMessage(product))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonClasses({ size: 'lg', variant: 'outline', className: 'w-full border-[#25D366]/50 hover:border-[#25D366] hover:bg-[#25D366]/10' })}
                >
                  <WhatsAppIcon className="h-5 w-5 text-[#25D366]" /> WhatsApp
                </a>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                <a href={site.contact.phoneHref} className="inline-flex items-center gap-2 text-sm text-zinc-300 hover:text-primary">
                  <Phone className="h-4 w-4 text-primary" aria-hidden /> Call {site.contact.phone}
                </a>
                <AddToQuoteButton product={product} size="sm" variant="secondary" className="sm:w-auto" />
              </div>
              <p className="mt-2 text-xs text-muted">Need several items? Add them to your quote list and send one request.</p>
            </div>

            <ul className="mt-6 grid gap-3 text-sm text-zinc-300 sm:grid-cols-3">
              <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" aria-hidden /> Genuine product</li>
              <li className="flex items-center gap-2"><Timer className="h-4 w-4 text-primary" aria-hidden /> Quote in 1 day</li>
              <li className="flex items-center gap-2"><Truck className="h-4 w-4 text-primary" aria-hidden /> Bulk delivery</li>
            </ul>

            {specs.length > 0 && (
              <section {...reveal()} className="mt-10" aria-labelledby="specs-heading">
                <h2 id="specs-heading" className="mb-3 font-semibold">Specifications</h2>
                <dl className="divide-y divide-border overflow-hidden rounded-lg border border-border">
                  {specs.map((s) => (
                    <div key={s.label} className="grid grid-cols-2 gap-4 px-4 py-3 text-sm odd:bg-surface/60">
                      <dt className="text-muted">{s.label}</dt>
                      <dd className="font-medium">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            {product.description && (
              <section {...reveal()} className="mt-10" aria-labelledby="desc-heading">
                <h2 id="desc-heading" className="mb-3 font-semibold">Description</h2>
                {/* Sanitised server-side with an allowlist (sanitize-html). */}
                <div className="prose-content" dangerouslySetInnerHTML={{ __html: product.description }} />
              </section>
            )}
          </div>
        </div>

        {product.related?.length > 0 && (
          <section className="mt-16 sm:mt-20" aria-labelledby="related-heading">
            <h2 id="related-heading" className="mb-6 text-2xl font-bold tracking-tight">More in {product.category.name}</h2>
            <ProductGrid products={product.related} />
          </section>
        )}
      </div>
    </div>
  );
}
