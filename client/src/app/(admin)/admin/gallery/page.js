'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Images, Loader2, RefreshCw, Trash2 } from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { ACCEPT, DropZone, checkFiles } from '@/components/admin/ImageManager';
import { Field, Input, Select } from '@/components/ui/input';
import { Alert, Card, Skeleton } from '@/components/ui/card';
import { adminService } from '@/services';
import { GALLERY_CATEGORIES } from '@/lib/site';
import { cn, getErrorMessage } from '@/lib/utils';

function Uploader({ onUploaded }) {
  const [category, setCategory] = useState('SHOWROOM');
  const [caption, setCaption] = useState('');
  const [message, setMessage] = useState(null);
  const upload = useMutation({
    mutationFn: (files) => adminService.addGalleryImages(files, { category, caption }),
    onSuccess: (res) => { setMessage({ tone: 'success', text: res.message }); setCaption(''); onUploaded(); },
    onError: (e) => setMessage({ tone: 'danger', text: getErrorMessage(e) }),
  });

  const onFiles = (list) => {
    const { files, error } = checkFiles(list);
    if (error) return setMessage({ tone: 'danger', text: error });
    if (files.length > 20) return setMessage({ tone: 'danger', text: 'Upload up to 20 photos at a time.' });
    setMessage(null);
    upload.mutate(files);
  };

  return (
    <Card className="h-fit space-y-4 p-6">
      <h2 className="font-semibold">Add photos</h2>
      {message && <Alert tone={message.tone}>{message.text}</Alert>}
      <Field label="Category" htmlFor="g-cat">
        <Select id="g-cat" value={category} onChange={(e) => setCategory(e.target.value)}>
          {GALLERY_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </Select>
      </Field>
      <Field label="Caption (optional, applied to this batch)" htmlFor="g-cap">
        <Input id="g-cap" value={caption} maxLength={200} onChange={(e) => setCaption(e.target.value)} placeholder="e.g. Our showroom in Madhyapur Thimi" />
      </Field>
      <DropZone
        onFiles={onFiles}
        disabled={upload.isPending}
        label={upload.isPending ? 'Uploading and processing…' : 'Drop photos here or click to choose'}
        hint="Up to 20 at a time · max 10 MB each · original shape kept"
      />
    </Card>
  );
}

function Tile({ img, index, count, busy, onMove, onSaved, onError }) {
  const [caption, setCaption] = useState(img.caption ?? '');
  const update = useMutation({ mutationFn: (body) => adminService.updateGalleryImage(img.id, body), onSuccess: onSaved, onError });
  const replace = useMutation({ mutationFn: (file) => adminService.replaceGalleryImage(img.id, file), onSuccess: onSaved, onError });
  const remove = useMutation({ mutationFn: () => adminService.deleteGalleryImage(img.id), onSuccess: onSaved, onError });
  const working = update.isPending || replace.isPending || remove.isPending;
  const iconBtn = 'grid h-8 w-8 place-items-center rounded-md bg-black/70 text-white transition hover:bg-black disabled:opacity-40';

  return (
    <li className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="relative aspect-[4/3] bg-black">
        <Image src={img.url} alt={img.caption || 'Gallery photo'} fill sizes="300px" className="object-cover" />
        {working && <div className="absolute inset-0 grid place-items-center bg-black/60"><Loader2 className="h-6 w-6 animate-spin text-white" /></div>}
        <div className="absolute inset-x-0 top-0 flex justify-between p-1.5">
          <div className="flex gap-1">
            <button className={iconBtn} disabled={busy || index === 0} onClick={() => onMove(index, -1)} aria-label="Move earlier" title="Move earlier"><ChevronLeft className="h-4 w-4" /></button>
            <button className={iconBtn} disabled={busy || index === count - 1} onClick={() => onMove(index, 1)} aria-label="Move later" title="Move later"><ChevronRight className="h-4 w-4" /></button>
          </div>
          <div className="flex gap-1">
            <label className={cn(iconBtn, 'cursor-pointer', working && 'pointer-events-none opacity-40')} title="Replace photo">
              <RefreshCw className="h-4 w-4" aria-hidden />
              <span className="sr-only">Replace photo</span>
              <input
                type="file"
                accept={ACCEPT}
                className="sr-only"
                onChange={(e) => {
                  const { files, error } = checkFiles(e.target.files);
                  if (error) onError(new Error(error));
                  else if (files.length) replace.mutate(files[0]);
                  e.target.value = '';
                }}
              />
            </label>
            <button className={cn(iconBtn, 'hover:bg-danger')} disabled={working} onClick={() => window.confirm('Delete this photo?') && remove.mutate()} aria-label="Delete photo" title="Delete">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      <div className="space-y-2 p-3">
        <Select
          value={img.category}
          onChange={(e) => update.mutate({ category: e.target.value })}
          className="h-9 text-xs"
          aria-label="Category"
        >
          {GALLERY_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </Select>
        <Input
          value={caption}
          maxLength={200}
          placeholder="Add a caption…"
          onChange={(e) => setCaption(e.target.value)}
          onBlur={() => caption !== (img.caption ?? '') && update.mutate({ caption })}
          onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
          className="h-9 text-xs"
          aria-label="Caption"
        />
      </div>
    </li>
  );
}

export default function AdminGalleryPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('');
  const [error, setError] = useState(null);
  const { data: images, isLoading } = useQuery({
    queryKey: ['admin-gallery', filter],
    queryFn: () => adminService.gallery(filter ? { category: filter } : {}),
  });
  const refresh = () => {
    setError(null);
    queryClient.invalidateQueries({ queryKey: ['admin-gallery'] });
    queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
  };
  const reorder = useMutation({ mutationFn: adminService.reorderGallery, onSuccess: refresh, onError: (e) => setError(getErrorMessage(e)) });

  const move = (index, delta) => {
    const ids = images.map((i) => i.id);
    [ids[index], ids[index + delta]] = [ids[index + delta], ids[index]];
    reorder.mutate(ids);
  };

  return (
    <>
      <AdminPageHeader title="Gallery" description="Showroom, stock, project and company photos shown on the Gallery page." />
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-4">
          <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="sm:w-56" aria-label="Filter by category">
            <option value="">All categories</option>
            {GALLERY_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </Select>
          {error && <Alert>{error}</Alert>}
          {isLoading ? (
            <Skeleton className="h-64" />
          ) : images.length ? (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {images.map((img, i) => (
                <Tile
                  key={img.id}
                  img={img}
                  index={i}
                  count={images.length}
                  busy={reorder.isPending}
                  onMove={move}
                  onSaved={refresh}
                  onError={(e) => setError(getErrorMessage(e))}
                />
              ))}
            </ul>
          ) : (
            <Card className="flex flex-col items-center px-6 py-16 text-center">
              <Images className="mb-3 h-9 w-9 text-muted" aria-hidden />
              <p className="font-medium">No photos{filter ? ' in this category' : ''} yet</p>
              <p className="mt-1 text-sm text-muted">Upload showroom, stock and project photos with the form.</p>
            </Card>
          )}
        </div>
        <Uploader onUploaded={refresh} />
      </div>
    </>
  );
}
