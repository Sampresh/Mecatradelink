'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Images, X } from 'lucide-react';
import { GALLERY_CATEGORIES } from '@/lib/site';
import { cn } from '@/lib/utils';

const label = (value) => GALLERY_CATEGORIES.find((c) => c.value === value)?.label ?? value;

function Lightbox({ images, index, onClose, onMove }) {
  const dialogRef = useRef(null);
  const image = images[index];

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog.open) dialog.showModal();
    const onKey = (e) => {
      if (e.key === 'ArrowRight') onMove(1);
      if (e.key === 'ArrowLeft') onMove(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onMove]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-label={image.caption || `${label(image.category)} photo`}
      className="m-0 h-[100dvh] max-h-none w-screen max-w-none bg-black/95 p-0 text-white backdrop:bg-black/80"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between gap-4 p-4">
          <p className="text-sm text-zinc-300">
            <span className="font-medium text-primary">{label(image.category)}</span>
            {image.caption && <> · {image.caption}</>}
            <span className="ml-2 text-zinc-500">{index + 1} / {images.length}</span>
          </p>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-white/10" aria-label="Close">
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="relative flex-1">
          <Image key={image.id} src={image.url} alt={image.caption || label(image.category)} fill sizes="100vw" className="object-contain" />
          {images.length > 1 && (
            <>
              <button onClick={() => onMove(-1)} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 hover:bg-black/80" aria-label="Previous photo">
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button onClick={() => onMove(1)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 hover:bg-black/80" aria-label="Next photo">
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
        </div>
      </div>
    </dialog>
  );
}

export default function GalleryGrid({ images, initialCategory = '' }) {
  const [category, setCategory] = useState(initialCategory);
  const [open, setOpen] = useState(null);
  const visible = category ? images.filter((i) => i.category === category) : images;
  const counts = Object.fromEntries(GALLERY_CATEGORIES.map((c) => [c.value, images.filter((i) => i.category === c.value).length]));

  const move = useCallback((d) => setOpen((i) => (i + d + visible.length) % visible.length), [visible.length]);

  if (!images.length) {
    return (
      <div className="flex flex-col items-center rounded-lg border border-dashed border-border py-20 text-center">
        <Images className="mb-4 h-10 w-10 text-muted" aria-hidden />
        <h2 className="text-lg font-semibold">Photos coming soon</h2>
        <p className="mt-1 text-sm text-muted">Showroom, stock and project photos will appear here.</p>
      </div>
    );
  }

  const tab = (active) =>
    cn('whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors',
      active ? 'border-primary bg-primary/10 text-primary' : 'border-border text-zinc-300 hover:border-primary/40');

  return (
    <>
      <div className="-mx-4 mb-8 flex gap-2 overflow-x-auto px-4 pb-1" role="tablist" aria-label="Gallery categories">
        <button role="tab" aria-selected={!category} onClick={() => setCategory('')} className={tab(!category)}>All ({images.length})</button>
        {GALLERY_CATEGORIES.filter((c) => counts[c.value]).map((c) => (
          <button key={c.value} role="tab" aria-selected={category === c.value} onClick={() => setCategory(c.value)} className={tab(category === c.value)}>
            {c.label} ({counts[c.value]})
          </button>
        ))}
      </div>

      <ul className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {visible.map((img, i) => (
          <li key={img.id} className="mb-4 break-inside-avoid">
            <button onClick={() => setOpen(i)} className="group relative block w-full overflow-hidden rounded-lg border border-border bg-surface text-left">
              <Image
                src={img.url}
                alt={img.caption || `${label(img.category)} photo`}
                width={img.width}
                height={img.height}
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                loading={i < 3 ? 'eager' : 'lazy'}
                className="h-auto w-full transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-10 text-sm">
                <span className="font-medium text-primary">{label(img.category)}</span>
                {img.caption && <span className="text-zinc-200"> · {img.caption}</span>}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {open !== null && visible[open] && <Lightbox images={visible} index={open} onClose={() => setOpen(null)} onMove={move} />}
    </>
  );
}
