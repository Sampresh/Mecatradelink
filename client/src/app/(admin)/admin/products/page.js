'use client';

import { useState } from 'react';
import Link from 'next/link';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Search, Star, Trash2 } from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import ProductImage from '@/components/catalog/ProductImage';
import { Button, ButtonLink } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { Alert, Badge, Card, Skeleton } from '@/components/ui/card';
import { adminService } from '@/services';
import { getErrorMessage } from '@/lib/utils';

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [params, setParams] = useState({ page: 1, limit: 20, status: 'all', q: '' });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-products', params],
    queryFn: () => adminService.products({ ...params, q: params.q || undefined }),
    placeholderData: keepPreviousData,
  });

  const remove = useMutation({
    mutationFn: adminService.deleteProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-products'] }),
  });

  const onDelete = (p) => {
    // Native confirm is fine for an internal tool.
    if (window.confirm(`Delete "${p.name}"? This cannot be undone.`)) remove.mutate(p.id);
  };

  return (
    <>
      <AdminPageHeader
        title="Products"
        description="Manage the catalogue shown on the website."
        action={<ButtonLink href="/admin/products/new"><Plus className="h-4 w-4" aria-hidden /> New product</ButtonLink>}
      />

      <form
        onSubmit={(e) => { e.preventDefault(); setParams((p) => ({ ...p, q: search, page: 1 })); }}
        className="mb-4 flex flex-col gap-3 sm:flex-row"
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, brand, model…" className="pl-9" aria-label="Search products" />
        </div>
        <Select value={params.status} onChange={(e) => setParams((p) => ({ ...p, status: e.target.value, page: 1 }))} className="sm:w-44" aria-label="Status filter">
          <option value="all">All statuses</option>
          <option value="active">Visible</option>
          <option value="inactive">Hidden</option>
        </Select>
        <Button type="submit" variant="secondary">Search</Button>
      </form>

      {(isError || remove.isError) && <Alert className="mb-4">{getErrorMessage(error || remove.error)}</Alert>}

      <Card className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted">
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              [0, 1, 2, 3].map((i) => (
                <tr key={i}><td colSpan={4} className="px-4 py-3"><Skeleton className="h-10" /></td></tr>
              ))}
            {data?.items.map((p) => (
              <tr key={p.id} className="border-b border-border/60 last:border-0 hover:bg-surface-2/40">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <ProductImage src={p.imageUrl} alt="" sizes="40px" className="h-10 w-10 shrink-0 rounded-md" />
                    <div className="min-w-0">
                      <Link href={`/admin/products/${p.id}`} className="font-medium hover:text-primary">{p.name}</Link>
                      <p className="text-xs text-muted">
                        {[p.brand?.name, p.model].filter(Boolean).join(' · ') || '—'}
                        {' · '}
                        {p.imageCount ? `${p.imageCount} photo${p.imageCount > 1 ? 's' : ''}` : <span className="text-primary">No photo</span>}
                      </p>
                    </div>
                    {p.isFeatured && <Star className="h-4 w-4 shrink-0 fill-primary text-primary" aria-label="Featured" />}
                  </div>
                </td>
                <td className="px-4 py-3 text-muted">{p.category?.name}</td>
                <td className="px-4 py-3">{p.isActive ? <Badge tone="success">Visible</Badge> : <Badge>Hidden</Badge>}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <ButtonLink href={`/admin/products/${p.id}`} variant="ghost" size="icon" aria-label={`Edit ${p.name}`}><Pencil className="h-4 w-4" /></ButtonLink>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(p)} aria-label={`Delete ${p.name}`}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </td>
              </tr>
            ))}
            {data && !data.items.length && (
              <tr><td colSpan={4} className="px-4 py-12 text-center text-muted">No products match.</td></tr>
            )}
          </tbody>
        </table>
      </Card>

      {data?.meta.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <Button variant="outline" size="sm" disabled={params.page <= 1} onClick={() => setParams((p) => ({ ...p, page: p.page - 1 }))}>Previous</Button>
          <span className="text-sm text-muted">Page {params.page} of {data.meta.totalPages} · {data.meta.total} products</span>
          <Button variant="outline" size="sm" disabled={params.page >= data.meta.totalPages} onClick={() => setParams((p) => ({ ...p, page: p.page + 1 }))}>Next</Button>
        </div>
      )}
    </>
  );
}
