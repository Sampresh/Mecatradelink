import Link from 'next/link';
import BrandMark from './BrandMark';
import { cn } from '@/lib/utils';

export default function Logo({ className, href = '/', compact = false }) {
  return (
    <Link href={href} className={cn('group inline-flex items-center gap-2.5', className)} aria-label="Meca Trade Link home">
      <BrandMark size={40} priority className="h-9 w-9 transition-transform duration-300 group-hover:rotate-12 sm:h-10 sm:w-10" />
      <span className={cn('leading-tight', compact && 'hidden sm:block')}>
        <span className="block text-[15px] font-bold tracking-tight text-foreground sm:text-base">Meca Trade Link</span>
        <span className="block text-[10px] font-medium uppercase tracking-[0.14em] text-muted sm:text-[11px]">Electrical Supplies</span>
      </span>
    </Link>
  );
}
