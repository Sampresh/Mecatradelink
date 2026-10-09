'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { Plus, Trash2, X } from 'lucide-react';
import ImageManager, { DropZone, checkFiles, MAX_IMAGES } from './ImageManager';
import { Button } from '@/components/ui/button';
import { Field, Input, Select, Textarea } from '@/components/ui/input';
import { Alert, Card, Skeleton } from '@/components/ui/card';
import { adminService, catalogService } from '@/services';
import { getErrorMessage } from '@/lib/utils';

const UNITS = ['piece', 'box', 'pack', 'roll', 'coil', 'metre', 'set'];

const schema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(150),
  slug: z.string().trim().max(120).regex(/^([a-z0-9]+(?:-[a-z0-9]+)*)?$/, 'Lowercase letters, numbers and dashes only').optional(),
  sku: z.string().trim().max(60).optional(),
  model: z.string().trim().max(120).optional(),
  brandId: z.string().optional(),
  summary: z.string().trim().max(300).optional(),
  description: z.string().max(10000).optional(),
  unit: z.enum(UNITS),
  categoryId: z.string().min(1, 'Choose a category'),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  specs: z.array(z.object({ label: z.string().trim().min(1, 'Required'), value: z.string().trim().min(1, 'Required') })),
});

const toForm = (p) => ({
  name: p?.name ?? '',
  slug: p?.slug ?? '',
  sku: p?.sku ?? '',
  model: p?.model ?? '',
  brandId: p?.brandId ?? '',
  summary: p?.summary ?? '',
  description: p?.description ?? '',
  unit: p?.unit ?? 'piece',
  categoryId: p?.categoryId ?? '',
  isActive: p?.isActive ?? true,
  isFeatured: p?.isFeatured ?? false,
  specs: Array.isArray(p?.specs) ? p.specs : [],
});

// The category/brand <select>s are uncontrolled: if the form mounts before their options
// exist, the product's saved values are lost (and saving would clear them). So load the
// option lists first, then mount the form.
export default function ProductForm({ product }) {
  const categories = useQuery({ queryKey: ['categories'], queryFn: catalogService.categories });
  const brands = useQuery({ queryKey: ['admin-brands'], queryFn: adminService.brands });

  if (categories.isError || brands.isError) return <Alert>{getErrorMessage(categories.error || brands.error)}</Alert>;
  if (!categories.data || !brands.data) return <Skeleton className="h-96" />;
  return <ProductFormFields product={product} categories={categories.data} brands={brands.data} />;
}

function ProductFormFields({ product, categories, brands }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = Boolean(product);
  const [pending, setPending] = useState([]); // photos chosen before the product exists
  const [fileError, setFileError] = useState(null);
  const [saved, setSaved] = useState(false);

  const { register, control, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema), defaultValues: toForm(product) });
  const specs = useFieldArray({ control, name: 'specs' });

  const mutation = useMutation({
    mutationFn: async ({ slug, ...values }) => {
      const body = { ...values, ...(slug && { slug }) };
      if (isEdit) return adminService.updateProduct(product.id, body);
      const createdProduct = await adminService.createProduct(body);
      if (!pending.length) return createdProduct;
      try {
        return await adminService.addProductImages(createdProduct.id, pending.map((p) => p.file));
      } catch {
        // Product exists; let the admin retry the photos on the edit page.
        return createdProduct;
      }
    },
    onSuccess: (p) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.setQueryData(['admin-product', p.id], p);
      if (isEdit) setSaved(true);
      else {
        pending.forEach((x) => URL.revokeObjectURL(x.preview));
        router.replace(`/admin/products/${p.id}`);
      }
    },
  });

  const queueFiles = (list) => {
    const { files, error } = checkFiles(list);
    setFileError(error ?? null);
    if (error) return;
    const room = MAX_IMAGES - pending.length;
    if (files.length > room) return setFileError(`You can add ${room} more photo${room === 1 ? '' : 's'} (max ${MAX_IMAGES}).`);
    setPending((prev) => [...prev, ...files.map((file) => ({ file, preview: URL.createObjectURL(file) }))]);
  };

  const unqueue = (i) =>
    setPending((prev) => {
      URL.revokeObjectURL(prev[i].preview);
      return prev.filter((_, j) => j !== i);
    });

  return (
    <form onSubmit={handleSubmit((v) => { setSaved(false); mutation.mutate(v); })} noValidate className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        {mutation.isError && <Alert>{getErrorMessage(mutation.error)}</Alert>}
        {saved && <Alert tone="success">Product saved.</Alert>}

        <Card className="space-y-4 p-6">
          <Field label="Product name" htmlFor="name" error={errors.name}>
            <Input id="name" {...register('name')} aria-invalid={!!errors.name} placeholder="e.g. 6A 1-Way Modular Switch" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Brand" htmlFor="brandId" hint={!brands.length ? 'Add brands under Admin → Brands' : undefined}>
              <Select id="brandId" {...register('brandId')}>
                <option value="">No brand / unbranded</option>
                {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </Select>
            </Field>
            <Field label="Model / specification" htmlFor="model" error={errors.model} hint="Shown on product cards, e.g. 16A 3-pin, 2.5 sq mm × 90 m">
              <Input id="model" {...register('model')} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="SKU / item code (optional)" htmlFor="sku" error={errors.sku}><Input id="sku" {...register('sku')} /></Field>
            <Field label="URL slug" htmlFor="slug" error={errors.slug} hint="Leave blank to generate"><Input id="slug" {...register('slug')} /></Field>
          </div>
          <Field label="Short summary" htmlFor="summary" error={errors.summary} hint="Shown on product cards and search results (300 chars)">
            <Textarea id="summary" rows={2} {...register('summary')} />
          </Field>
          <Field label="Description" htmlFor="description" error={errors.description} hint="Basic HTML allowed: <p>, <ul>, <li>, <strong>, <em>, <h3>">
            <Textarea id="description" rows={6} className="font-mono text-xs" {...register('description')} />
          </Field>
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-baseline justify-between gap-4">
            <h2 className="font-semibold">Photos</h2>
            <span className="text-xs text-muted">First photo is the cover · max {MAX_IMAGES}</span>
          </div>
          {isEdit ? (
            <ImageManager product={product} />
          ) : (
            <div className="space-y-4">
              {fileError && <Alert>{fileError}</Alert>}
              {pending.length > 0 && (
                <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                  {pending.map((p, i) => (
                    <li key={p.preview} className="relative aspect-square overflow-hidden rounded-lg border border-border bg-white">
                      <Image src={p.preview} alt={`New photo ${i + 1}`} fill unoptimized className="object-contain" />
                      {i === 0 && <span className="absolute left-1.5 top-1.5 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">Cover</span>}
                      <button type="button" onClick={() => unqueue(i)} className="absolute right-1.5 top-1.5 rounded-full bg-black/70 p-1 text-white hover:bg-danger" aria-label={`Remove new photo ${i + 1}`}>
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {pending.length < MAX_IMAGES && (
                <DropZone onFiles={queueFiles} label="Drop photos here or click to choose" hint="Uploaded when you create the product. Auto-fitted to a white square." />
              )}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Specifications</h2>
            <Button size="sm" variant="secondary" onClick={() => specs.append({ label: '', value: '' })}>
              <Plus className="h-4 w-4" aria-hidden /> Add row
            </Button>
          </div>
          {specs.fields.length === 0 && <p className="text-sm text-muted">e.g. Rating → 6A, 240V · Wattage → 9W · Length → 90 m</p>}
          <div className="space-y-2">
            {specs.fields.map((f, i) => (
              <div key={f.id} className="flex gap-2">
                <Input placeholder="Label" aria-label={`Spec ${i + 1} label`} {...register(`specs.${i}.label`)} aria-invalid={!!errors.specs?.[i]?.label} />
                <Input placeholder="Value" aria-label={`Spec ${i + 1} value`} {...register(`specs.${i}.value`)} aria-invalid={!!errors.specs?.[i]?.value} />
                <Button variant="ghost" size="icon" onClick={() => specs.remove(i)} aria-label="Remove row"><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="space-y-4 p-6">
          <Field label="Category" htmlFor="categoryId" error={errors.categoryId}>
            <Select id="categoryId" {...register('categoryId')} aria-invalid={!!errors.categoryId}>
              <option value="">Select…</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </Field>
          <Field label="Sold per" htmlFor="unit">
            <Select id="unit" {...register('unit')}>{UNITS.map((u) => <option key={u} value={u}>{u}</option>)}</Select>
          </Field>
          <label className="flex items-center gap-3 text-sm"><input type="checkbox" className="h-4 w-4 accent-amber-500" {...register('isActive')} /> Visible on website</label>
          <label className="flex items-center gap-3 text-sm"><input type="checkbox" className="h-4 w-4 accent-amber-500" {...register('isFeatured')} /> Featured on home page</label>
        </Card>
        <Button type="submit" size="lg" className="w-full" loading={mutation.isPending}>
          {isEdit ? 'Save product details' : pending.length ? `Create product & upload ${pending.length} photo${pending.length > 1 ? 's' : ''}` : 'Create product'}
        </Button>
        {isEdit && <p className="text-center text-xs text-muted">Photo changes save instantly. <Link href={`/products/${product.slug}`} target="_blank" className="text-primary hover:underline">Preview</Link></p>}
      </div>
    </form>
  );
}
