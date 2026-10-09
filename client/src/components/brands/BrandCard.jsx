import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import BrandLogo from '@/components/catalog/BrandLogo';

export default function BrandCard({ brand }) {
  return (
    <Link
      href={`/brands/${brand.slug}`}
      className="group flex flex-col rounded-lg border border-border bg-surface p-4 transition-colors hover:border-primary/50 hover:bg-surface-2"
    >
      <BrandLogo brand={brand} size="lg" />
      <div className="mt-4 flex items-center justify-between gap-2">
        <h3 className="font-semibold">{brand.name}</h3>
        <ArrowUpRight className="h-4 w-4 text-muted transition group-hover:text-primary" aria-hidden />
      </div>
      {brand.categories?.length > 0 && (
        <p className="mt-1 line-clamp-2 text-xs text-muted">{brand.categories.map((c) => c.name).join(' · ')}</p>
      )}
      <p className="mt-auto pt-3 text-xs font-medium text-zinc-500">{brand.productCount} products</p>
    </Link>
  );
}
