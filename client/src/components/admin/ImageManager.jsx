'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, ImagePlus, Loader2, RefreshCw, Star, Trash2, UploadCloud } from 'lucide-react';
import { Alert } from '@/components/ui/card';
import { adminService } from '@/services';
import { cn, getErrorMessage } from '@/lib/utils';

export const ACCEPT = 'image/jpeg,image/png,image/webp,image/avif';
export const MAX_IMAGES = 10;
const MAX_BYTES = 10 * 1024 * 1024;
// Placeholder photos added by server/scripts/sample-photos.js (tagged via alt text).
const isSample = (img) => Boolean(img.alt?.endsWith('(sample image)'));

/** Client-side pre-check (the server re-validates and re-encodes every file). */
export function checkFiles(list) {
  const files = Array.from(list);
  const bad = files.find((f) => !ACCEPT.split(',').includes(f.type));
  if (bad) return { error: `"${bad.name}" isn't a JPEG, PNG, WebP or AVIF image.` };
  const big = files.find((f) => f.size > MAX_BYTES);
  if (big) return { error: `"${big.name}" is larger than 10 MB.` };
  return { files };
}

/** Drag-and-drop / click file picker. */
export function DropZone({ onFiles, disabled, multiple = true, label, hint }) {
  const inputRef = useRef(null);
  const [over, setOver] = useState(false);
  return (
    <label
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); if (!disabled && e.dataTransfer.files.length) onFiles(e.dataTransfer.files); }}
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-center text-sm transition-colors',
        over ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50 hover:bg-surface-2/50',
        disabled && 'pointer-events-none opacity-50',
      )}
    >
      <UploadCloud className="h-7 w-7 text-primary" aria-hidden />
      <span className="font-medium">{label}</span>
      {hint && <span className="text-xs text-muted">{hint}</span>}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple={multiple}
        disabled={disabled}
        className="sr-only"
        onChange={(e) => { if (e.target.files.length) onFiles(e.target.files); e.target.value = ''; }}
      />
    </label>
  );
}

/** Photo manager for an existing product: add, reorder, set cover, replace, delete. */
export default function ImageManager({ product }) {
  const queryClient = useQueryClient();
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const images = product.images ?? [];
  const sampleCount = images.filter(isSample).length;
  // Uploading real photos removes the samples, so they don't count against the limit.
  const remaining = MAX_IMAGES - images.length + sampleCount;

  const onSaved = (p) => {
    setError(null);
    queryClient.setQueryData(['admin-product', p.id], p);
    queryClient.invalidateQueries({ queryKey: ['admin-products'] });
  };
  const opts = { onSuccess: onSaved, onError: (e) => setError(getErrorMessage(e)), onSettled: () => setBusyId(null) };

  const add = useMutation({ mutationFn: (files) => adminService.addProductImages(product.id, files), ...opts });
  const replace = useMutation({ mutationFn: ({ imageId, file }) => adminService.replaceProductImage(product.id, imageId, file), ...opts });
  const reorder = useMutation({ mutationFn: (ids) => adminService.reorderProductImages(product.id, ids), ...opts });
  const remove = useMutation({ mutationFn: (imageId) => adminService.deleteProductImage(product.id, imageId), ...opts });
  const busy = add.isPending || replace.isPending || reorder.isPending || remove.isPending;

  const handleAdd = (list) => {
    const { files, error: err } = checkFiles(list);
    if (err) return setError(err);
    if (files.length > remaining) return setError(`You can add ${remaining} more photo${remaining === 1 ? '' : 's'} (max ${MAX_IMAGES}).`);
    add.mutate(files);
  };

  const move = (index, delta) => {
    const ids = images.map((i) => i.id);
    const target = index + delta;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    setBusyId(images[index].id);
    reorder.mutate(ids);
  };

  const makeCover = (index) => {
    const ids = images.map((i) => i.id);
    ids.unshift(...ids.splice(index, 1));
    setBusyId(images[index].id);
    reorder.mutate(ids);
  };

  const handleReplace = (imageId, list) => {
    const { files, error: err } = checkFiles(list);
    if (err) return setError(err);
    setBusyId(imageId);
    replace.mutate({ imageId, file: files[0] });
  };

  const handleDelete = (img, index) => {
    if (!window.confirm(`Delete photo ${index + 1}?${index === 0 && images.length > 1 ? ' The next photo becomes the cover.' : ''}`)) return;
    setBusyId(img.id);
    remove.mutate(img.id);
  };

  const iconBtn = 'grid h-8 w-8 place-items-center rounded-md bg-black/70 text-white transition hover:bg-black disabled:opacity-40';

  return (
    <div className="space-y-4">
      {error && <Alert>{error}</Alert>}
      {sampleCount > 0 && (
        <Alert tone="info">
          {sampleCount === images.length ? 'These are' : `${sampleCount} of these are`} sample placeholder photos. Upload real photos and the
          samples are removed automatically (or use Replace on each photo).
        </Alert>
      )}

      {images.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((img, i) => (
            <li key={img.id} className={cn('group relative overflow-hidden rounded-lg border-2 bg-white', i === 0 ? 'border-primary' : 'border-border')}>
              <div className="relative aspect-square">
                <Image src={img.url} alt={img.alt || `Photo ${i + 1}`} fill sizes="200px" className="object-contain" />
                {busyId === img.id && (
                  <div className="absolute inset-0 grid place-items-center bg-white/70"><Loader2 className="h-6 w-6 animate-spin text-zinc-800" /></div>
                )}
              </div>
              {i === 0 && (
                <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-primary-foreground">
                  <Star className="h-3 w-3 fill-current" aria-hidden /> Cover
                </span>
              )}
              {isSample(img) && (
                <span className="absolute right-2 top-2 rounded-full bg-zinc-900/80 px-2 py-0.5 text-[11px] font-semibold text-white">Sample</span>
              )}
              <div className="flex items-center justify-between gap-1 bg-surface p-1.5">
                <div className="flex gap-1">
                  <button type="button" className={iconBtn} disabled={busy || i === 0} onClick={() => move(i, -1)} aria-label={`Move photo ${i + 1} earlier`} title="Move earlier">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button type="button" className={iconBtn} disabled={busy || i === images.length - 1} onClick={() => move(i, 1)} aria-label={`Move photo ${i + 1} later`} title="Move later">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex gap-1">
                  {i !== 0 && (
                    <button type="button" className={iconBtn} disabled={busy} onClick={() => makeCover(i)} aria-label={`Make photo ${i + 1} the cover`} title="Make cover">
                      <Star className="h-4 w-4" />
                    </button>
                  )}
                  <label className={cn(iconBtn, 'cursor-pointer', busy && 'pointer-events-none opacity-40')} title="Replace photo">
                    <RefreshCw className="h-4 w-4" aria-hidden />
                    <span className="sr-only">Replace photo {i + 1}</span>
                    <input type="file" accept={ACCEPT} className="sr-only" disabled={busy} onChange={(e) => { if (e.target.files.length) handleReplace(img.id, e.target.files); e.target.value = ''; }} />
                  </label>
                  <button type="button" className={cn(iconBtn, 'hover:bg-danger')} disabled={busy} onClick={() => handleDelete(img, i)} aria-label={`Delete photo ${i + 1}`} title="Delete photo">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="flex items-center gap-2 text-sm text-muted"><ImagePlus className="h-4 w-4" aria-hidden /> No photos yet. The product shows a placeholder until you add one.</p>
      )}

      {remaining > 0 && (
        <DropZone
          onFiles={handleAdd}
          disabled={busy}
          label={add.isPending ? 'Uploading and processing…' : 'Drop photos here or click to choose'}
          hint={`Up to ${remaining} more · JPEG, PNG, WebP · max 10 MB each. Photos are auto-fitted to a white square.`}
        />
      )}
    </div>
  );
}
