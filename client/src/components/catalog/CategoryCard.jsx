import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import CategoryIcon from '@/components/common/CategoryIcon';

export default function CategoryCard({ category }) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-surface p-4 transition-all duration-300 hover:border-primary/50 hover:bg-surface-2 sm:p-6"
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/0 blur-2xl transition-colors duration-500 group-hover:bg-primary/20" />
      <span className="mb-3 grid h-10 w-10 place-items-center rounded-lg border border-primary/25 bg-primary/10 text-primary sm:mb-5 sm:h-12 sm:w-12">
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
