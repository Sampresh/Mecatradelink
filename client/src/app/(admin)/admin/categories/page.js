'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { Pencil, Trash2 } from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import CategoryIcon, { CATEGORY_ICONS } from '@/components/common/CategoryIcon';
import { Button } from '@/components/ui/button';
import { Field, Input, Select, Textarea } from '@/components/ui/input';
import { Alert, Card, Skeleton } from '@/components/ui/card';
import { adminService, catalogService } from '@/services';
import { getErrorMessage } from '@/lib/utils';

const schema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(80),
  description: z.string().trim().max(500).optional(),
  icon: z.string().optional(),
  sortOrder: z.coerce.number().int().min(0).max(999),
});
const EMPTY = { name: '', description: '', icon: 'Zap', sortOrder: 0 };

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(null);
  const { data: categories, isLoading } = useQuery({ queryKey: ['categories'], queryFn: catalogService.categories });
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema), defaultValues: EMPTY });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['categories'] });

  const save = useMutation({
    mutationFn: (values) => (editing ? adminService.updateCategory(editing.id, values) : adminService.createCategory(values)),
    onSuccess: () => { invalidate(); setEditing(null); reset(EMPTY); },
  });
  const remove = useMutation({ mutationFn: adminService.deleteCategory, onSuccess: invalidate });

  const startEdit = (c) => {
    setEditing(c);
    reset({ name: c.name, description: c.description ?? '', icon: c.icon ?? 'Zap', sortOrder: c.sortOrder });
  };

  const onDelete = (c) => {
    if (window.confirm(`Delete category "${c.name}"?`)) remove.mutate(c.id);
  };

  return (
    <>
      <AdminPageHeader title="Categories" description="Group products into the sections shown on the website." />
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <Card className="overflow-hidden">
          {remove.isError && <Alert className="m-4">{getErrorMessage(remove.error)}</Alert>}
          {isLoading ? (
            <div className="p-4"><Skeleton className="h-48" /></div>
          ) : (
            <ul className="divide-y divide-border">
              {categories.map((c) => (
                <li key={c.id} className={`flex items-center gap-4 px-4 py-3 ${editing?.id === c.id ? 'bg-primary/5' : ''}`}>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><CategoryIcon name={c.icon} className="h-5 w-5" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-muted">/{c.slug} · {c.productCount} products · order {c.sortOrder}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => startEdit(c)} aria-label={`Edit ${c.name}`}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(c)} aria-label={`Delete ${c.name}`}><Trash2 className="h-4 w-4" /></Button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="h-fit p-6">
          <h2 className="mb-4 font-semibold">{editing ? `Edit ${editing.name}` : 'New category'}</h2>
          <form onSubmit={handleSubmit((v) => save.mutate(v))} noValidate className="space-y-4">
            {save.isError && <Alert>{getErrorMessage(save.error)}</Alert>}
            <Field label="Name" htmlFor="name" error={errors.name}><Input id="name" {...register('name')} aria-invalid={!!errors.name} /></Field>
            <Field label="Description" htmlFor="description" error={errors.description}><Textarea id="description" rows={3} {...register('description')} /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Icon" htmlFor="icon">
                <Select id="icon" {...register('icon')}>{Object.keys(CATEGORY_ICONS).map((k) => <option key={k} value={k}>{k}</option>)}</Select>
              </Field>
              <Field label="Sort order" htmlFor="sortOrder" error={errors.sortOrder}><Input id="sortOrder" type="number" min={0} {...register('sortOrder')} /></Field>
            </div>
            <div className="flex gap-2">
              <Button type="submit" loading={save.isPending} className="flex-1">{editing ? 'Save' : 'Create'}</Button>
              {editing && <Button variant="outline" onClick={() => { setEditing(null); reset(EMPTY); }}>Cancel</Button>}
            </div>
          </form>
        </Card>
      </div>
    </>
  );
}
