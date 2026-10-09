import Image from 'next/image';
import { cn } from '@/lib/utils';

// The Meca Trade Link badge (transparent PNG cut from docs/brand/logo-original.png).
// Picks the smallest source file that stays sharp at 3× density.
export default function BrandMark({ size = 40, className, priority, alt = '' }) {
  const src = size <= 32 ? '/images/brand/logo-96.png' : size <= 64 ? '/images/brand/logo-192.png' : '/images/brand/logo-512.png';
  return <Image src={src} alt={alt} width={size} height={size} priority={priority} className={cn('select-none', className)} />;
}
