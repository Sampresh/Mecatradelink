'use client';

import { useState } from 'react';
import Image from 'next/image';
import ProductImage from './ProductImage';
import { cn } from '@/lib/utils';

// Main photo + thumbnails. Photos are uniform white squares (normalised on upload).
export default function ProductGallery({ images, name }) {
  const [active, setActive] = useState(0);
  if (!images.length) return <ProductImage src={null} alt={name} className="rounded-lg border border-border" />;
  const current = images[Math.min(active, images.length - 1)];

  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-white">
        <Image
          key={current.id}
          src={current.url}
          alt={current.alt || name}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-contain"
        />
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2" role="tablist" aria-label="Product photos">
          {images.map((img, i) => (
            <button
              key={img.id}
              role="tab"
              aria-selected={i === active}
              aria-label={`Photo ${i + 1} of ${images.length}`}
              onClick={() => setActive(i)}
              className={cn(
                'relative aspect-square overflow-hidden rounded-md border-2 bg-white transition',
                i === active ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100',
              )}
            >
              <Image src={img.url} alt="" fill sizes="120px" className="object-contain" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
