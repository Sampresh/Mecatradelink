'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { Award, Pencil, Trash2, X } from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { DropZone, checkFiles } from '@/components/admin/ImageManager';
import BrandLogo from '@/components/catalog/BrandLogo';
import { Button } from '@/components/ui/button';
import { Field, Input, Textarea } from '@/components/ui/input';
import { Alert, Card, Skeleton } from '@/components/ui/card';
import { adminService, catalogService } from '@/services';
import { getErrorMessage } from '@/lib/utils';

const schema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(80),
  description: z.string().trim().max(600).optional(),
  website: z.string().trim().max(500).regex(/^(https:\/\/.+)?$/, 'Must start with https://').optional(),
  sortOrder: z.coerce.number().int().min(0).max(999),
  categoryIds: z.array(z.string()),
});
const EMPTY = { name: '', description: '', website: '', sortOrder: 0, categoryIds: [] };
const toForm = (b) => ({
  name: b.name, description: b.description ?? '', website: b.website ?? '', sortOrder: b.sortOrder,
  categoryIds: b.categories.map((c) => c.id),
});

function BrandEditor({ brand, categories, onDone }) {
  const queryClient = useQueryClient();
  const [logo, setLogo] = useState(null); // { file, preview } chosen in this form
  const [error, setError] = useState(null);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: brand ? toForm(brand) : EMPTY,
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-brands'] });
    queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
  };

  const save = useMutation({
    mutationFn: async (values) => {
      const saved = brand ? await adminService.updateBrand(brand.id, values) : await adminService.createBrand(values);
      return logo ? adminService.uploadBrandLogo(saved.id, logo.file) : saved;
    },
    onSuccess: () => { refresh(); onDone(); },
    onError: (e) => setError(getErrorMessage(e)),
  });
  const removeLogo = useMutation({
    mutationFn: () => adminService.deleteBrandLogo(brand.id),
    onSuccess: () => { refresh(); onDone(); },
    onError: (e) => setError(getErrorMessage(e)),
  });

  const pickLogo = (list) => {
    const { files, error: err } = checkFiles(list);
    if (err) return setError(err);
    setError(null);
    setLogo({ file: files[0], preview: URL.createObjectURL(files[0]) });
  };

  return (
    <Card className="h-fit p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold">{brand ? `Edit ${brand.name}` : 'New brand'}</h2>
        {brand && <button onClick={onDone} className="rounded-md p-1 text-muted hover:text-foreground" aria-label="Cancel editing"><X className="h-4 w-4" /></button>}
      </div>
      <form onSubmit={handleSubmit((v) => { setError(null); save.mutate(v); })} noValidate className="space-y-4">
        {error && <Alert>{error}</Alert>}
        <Field label="Brand name" htmlFor="b-name" error={errors.name}><Input id="b-name" {...register('name')} aria-invalid={!!errors.name} /></Field>

        <div>
          <p className="mb-1.5 text-sm font-medium">Logo</p>
          {logo || brand?.logoUrl ? (
            <div className="flex items-center gap-3">
              <div className="relative h-16 w-40 rounded-md bg-white">
                <Image src={logo?.preview ?? brand.logoUrl} alt="Logo preview" fill unoptimized={Boolean(logo)} sizes="160px" className="object-contain p-2" />
              </div>
              <div className="flex flex-col gap-1 text-sm">
                <label className="cursor-pointer text-primary hover:underline">
                  Replace
                  <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" onChange={(e) => { if (e.target.files.length) pickLogo(e.target.files); e.target.value = ''; }} />
                </label>
                {logo ? (
                  <button type="button" className="text-left text-muted hover:text-foreground" onClick={() => setLogo(null)}>Undo</button>
                ) : (
                  <button type="button" className="text-left text-danger hover:underline" onClick={() => window.confirm('Remove this logo?') && removeLogo.mutate()}>Remove</button>
                )}
              </div>
            </div>
          ) : (
            <DropZone onFiles={pickLogo} multiple={false} label="Upload logo" hint="PNG with transparent background works best" />
          )}
        </div>

        <Field label="Short description (optional)" htmlFor="b-desc" error={errors.description}><Textarea id="b-desc" rows={3} {...register('description')} /></Field>
        <div className="grid grid-cols-[1fr_96px] gap-3">
          <Field label="Website (optional)" htmlFor="b-web" error={errors.website}><Input id="b-web" placeholder="https://" {...register('website')} /></Field>
          <Field label="Order" htmlFor="b-order" error={errors.sortOrder}><Input id="b-order" type="number" min={0} {...register('sortOrder')} /></Field>
        </div>
        <fieldset>
          <legend className="mb-1.5 text-sm font-medium">Product categories</legend>
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {categories.map((c) => (
              <label key={c.id} className="flex items-center gap-2 text-sm text-zinc-300">
                <input type="checkbox" value={c.id} className="h-4 w-4 accent-amber-500" {...register('categoryIds')} /> {c.name}
              </label>
            ))}
          </div>
        </fieldset>
        <Button type="submit" className="w-full" loading={save.isPending}>{brand ? 'Save brand' : 'Add brand'}</Button>
      </form>
    </Card>
  );
}

export default function AdminBrandsPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(null);
  const [formKey, setFormKey] = useState(0);
  const { data: brands, isLoading } = useQuery({ queryKey: ['admin-brands'], queryFn: adminService.brands });
  const { data: categories = [], isSuccess: categoriesLoaded } = useQuery({ queryKey: ['categories'], queryFn: catalogService.categories });

  const remove = useMutation({
    mutationFn: adminService.deleteBrand,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-brands'] }),
  });

  const done = () => { setEditing(null); setFormKey((k) => k + 1); };

  return (
    <>
      <AdminPageHeader title="Brands" description="Brands you deal with, shown on the Brands page and home page." />
      <div className="grid gap-6 xl:grid-cols-[1fr_400px]">
        <Card className="overflow-hidden">
          {remove.isError && <Alert className="m-4">{getErrorMessage(remove.error)}</Alert>}
          {isLoading ? (
            <div className="p-4"><Skeleton className="h-48" /></div>
          ) : brands.length ? (
            <ul className="divide-y divide-border">
              {brands.map((b) => (
                <li key={b.id} className={`flex items-center gap-4 px-4 py-3 ${editing?.id === b.id ? 'bg-primary/5' : ''}`}>
                  <BrandLogo brand={b} size="sm" className="h-12 w-24 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{b.name}</p>
                    <p className="truncate text-xs text-muted">
                      {b._count.products} products{b.categories.length ? ` · ${b.categories.map((c) => c.name).join(', ')}` : ''}
                      {!b.logoUrl && <span className="text-primary"> · no logo</span>}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setEditing(b)} aria-label={`Edit ${b.name}`}><Pencil className="h-4 w-4" /></Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => window.confirm(`Delete brand "${b.name}"? Its ${b._count.products} product(s) stay, just without a brand.`) && remove.mutate(b.id)}
                    aria-label={`Delete ${b.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center px-6 py-16 text-center">
              <Award className="mb-3 h-9 w-9 text-muted" aria-hidden />
              <p className="font-medium">No brands yet</p>
              <p className="mt-1 text-sm text-muted">Add the brands you deal with, with their logos. Then assign them to products.</p>
            </div>
          )}
        </Card>
        {/* Mount after categories load so the checkboxes reflect the brand's saved categories. */}
        {categoriesLoaded ? (
          <BrandEditor key={editing?.id ?? `new-${formKey}`} brand={editing} categories={categories} onDone={done} />
        ) : (
          <Skeleton className="h-96" />
        )}
      </div>
    </>
  );
}
