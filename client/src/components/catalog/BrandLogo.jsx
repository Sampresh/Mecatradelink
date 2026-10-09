import Image from 'next/image';
import { cn } from '@/lib/utils';

// Logos sit on a light plate so dark and coloured logos stay legible on the dark theme.
export default function BrandLogo({ brand, className, size = 'md' }) {
  const heights = { sm: 'h-8 px-2', md: 'h-16 px-4', lg: 'h-24 px-6' };
  return (
    <div className={cn('relative flex items-center justify-center rounded-md bg-white', heights[size], className)}>
      {brand.logoUrl ? (
        <div className="relative h-[70%] w-full">
          <Image src={brand.logoUrl} alt={`${brand.name} logo`} fill sizes="240px" className="object-contain" />
        </div>
      ) : (
        <span className={cn('truncate font-bold tracking-tight text-zinc-900', size === 'sm' ? 'text-xs' : 'text-lg')}>{brand.name}</span>
      )}
    </div>
  );
}
