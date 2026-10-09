import Link from 'next/link';
import ProductImage from './ProductImage';
import AddToQuoteButton from './AddToQuoteButton';
import EnquireButton from './EnquireButton';
import { reveal } from '@/lib/motion';

export default function ProductCard({ product }) {
  return (
    <article {...reveal()} className="card-glow group flex flex-col overflow-hidden rounded-lg border border-border bg-surface">
      <Link href={`/products/${product.slug}`} className="block" tabIndex={-1} aria-hidden>
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, 50vw"
          className="transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
        />
      </Link>
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <div className="mb-1 flex items-center gap-2 text-[11px] sm:mb-1.5 sm:text-xs">
          {product.category && <span className="truncate font-medium text-primary">{product.category.name}</span>}
          {product.brand && <span className="ml-auto hidden truncate font-semibold uppercase tracking-wide text-zinc-400 sm:inline">{product.brand.name}</span>}
        </div>
        <h3 className="text-sm font-semibold leading-snug sm:text-base">
          <Link href={`/products/${product.slug}`} className="line-clamp-2 hover:text-primary sm:line-clamp-none">{product.name}</Link>
        </h3>
        {product.model && <p className="mt-0.5 truncate font-mono text-[11px] text-zinc-400 sm:text-xs">{product.model}</p>}
        {product.summary && <p className="mt-2 line-clamp-2 hidden text-sm text-muted sm:block">{product.summary}</p>}
        <div className="mt-auto flex gap-1.5 pt-3 sm:gap-2 sm:pt-4">
          <EnquireButton
            product={product}
            className="h-9 min-w-0 flex-1 px-2 text-xs sm:px-3 sm:text-sm"
            label={<><span className="sm:hidden">Enquire</span><span className="hidden sm:inline">Enquire Now</span></>}
          />
          <AddToQuoteButton product={product} compact />
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({ products }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
