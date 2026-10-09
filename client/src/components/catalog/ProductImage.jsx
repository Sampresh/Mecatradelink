import Image from 'next/image';
import BrandMark from '@/components/common/BrandMark';
import { cn } from '@/lib/utils';

// Product photos are normalised to white squares on upload, so they sit on a white tile.
export default function ProductImage({ src, alt, className, sizes = '(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw', priority }) {
  return (
    <div className={cn('relative aspect-square overflow-hidden', src ? 'bg-white' : 'bg-gradient-to-br from-surface-2 to-surface', className)}>
      {src ? (
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-contain" />
      ) : (
        <div className="absolute inset-0 grid place-items-center">
          <div className="absolute inset-0 bg-[linear-gradient(rgb(var(--border)/0.35)_1px,transparent_1px),linear-gradient(90deg,rgb(var(--border)/0.35)_1px,transparent_1px)] bg-[size:24px_24px]" />
          <BrandMark size={64} className="relative h-16 w-16 opacity-25 grayscale" />
          <span className="sr-only">{alt} (photo coming soon)</span>
        </div>
      )}
    </div>
  );
}
