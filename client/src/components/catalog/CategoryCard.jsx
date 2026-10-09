import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import CategoryIcon from '@/components/common/CategoryIcon';
import { reveal } from '@/lib/motion';

export default function CategoryCard({ category }) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      {...reveal()}
      className="card-glow card-glow-fill group flex flex-col overflow-hidden rounded-lg border border-border bg-surface p-4 sm:p-6"
    >
      <span className="mb-3 grid h-10 w-10 place-items-center rounded-lg border border-primary/25 bg-primary/10 text-primary transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110 group-hover:-rotate-6 sm:mb-5 sm:h-12 sm:w-12">
        <CategoryIcon name={category.icon} className="h-5 w-5 sm:h-6 sm:w-6" />
      </span>
      <h3 className="flex items-center gap-1 text-sm font-semibold leading-snug sm:text-base">
        {category.name}
        <ArrowUpRight className="hidden h-4 w-4 shrink-0 text-muted sm:block transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden />
      </h3>
      {category.description && <p className="mt-2 line-clamp-2 hidden text-sm text-muted sm:block">{category.description}</p>}
      {category.productCount !== undefined && (
        <p className="mt-1 text-[11px] font-medium text-zinc-500 sm:mt-4 sm:text-xs">{category.productCount} products</p>
      )}
    </Link>
  );
}
