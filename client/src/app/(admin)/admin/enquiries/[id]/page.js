'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Mail, Phone, Trash2 } from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import EnquiryStatusBadge, { ENQUIRY_STATUSES } from '@/components/user/EnquiryStatusBadge';
import { Button, ButtonLink, buttonClasses } from '@/components/ui/button';
import WhatsAppIcon from '@/components/common/WhatsAppIcon';
import { Field, Select, Textarea } from '@/components/ui/input';
import { Alert, Card, Skeleton } from '@/components/ui/card';
import { adminService } from '@/services';
import { formatDate, getErrorMessage } from '@/lib/utils';

// Local edit state seeded from the record (remounted per enquiry via key).
function FollowUp({ enquiry: e, onSaved, onDelete, deleting }) {
  const [status, setStatus] = useState(e.status);
  const [note, setNote] = useState(e.adminNote ?? '');
  const update = useMutation({
    mutationFn: (body) => adminService.updateEnquiry(e.id, body),
    onSuccess: onSaved,
  });

  return (
    <Card className="h-fit space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Follow-up</h2>
        <EnquiryStatusBadge status={e.status} />
      </div>
      {update.isError && <Alert>{getErrorMessage(update.error)}</Alert>}
      {update.isSuccess && !update.isPending && <Alert tone="success">Saved.</Alert>}
      <Field label="Status" htmlFor="status">
        <Select id="status" value={status} onChange={(ev) => setStatus(ev.target.value)}>
          {ENQUIRY_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </Select>
      </Field>
      <Field label="Internal note" htmlFor="note" hint="Only visible to admins">
        <Textarea id="note" rows={5} value={note} onChange={(ev) => setNote(ev.target.value)} />
      </Field>
      <Button className="w-full" loading={update.isPending} onClick={() => update.mutate({ status, adminNote: note })}>Save</Button>
      <Button
        variant="ghost"
        className="w-full text-danger hover:text-danger"
        loading={deleting}
        onClick={onDelete}
      >
        <Trash2 className="h-4 w-4" aria-hidden /> Delete enquiry
      </Button>
    </Card>
  );
}

// Nepali mobile numbers are 10 digits starting with 9; add the 977 country code for wa.me.
const customerWhatsapp = (phone, text) => {
  let digits = phone.replace(/\D/g, '');
  if (digits.length === 10 && digits.startsWith('9')) digits = `977${digits}`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
};

export default function AdminEnquiryPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: e, isLoading, isError, error } = useQuery({
    queryKey: ['admin-enquiry', params.id],
    queryFn: () => adminService.enquiry(params.id),
  });
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-enquiries'] });
    queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
  };

  const remove = useMutation({
    mutationFn: () => adminService.deleteEnquiry(params.id),
    onSuccess: () => { invalidate(); router.replace('/admin/enquiries'); },
  });

  const rows = e && [
    ['Email', e.email && <a key="e" href={`mailto:${e.email}`} className="text-primary hover:underline">{e.email}</a>],
    ['Phone', e.phone && <a key="p" href={`tel:${e.phone}`} className="hover:text-primary">{e.phone}</a>],
    ['Company', e.company],
    ['Location', e.location],
    ['Account', e.user && `${e.user.name} (registered)`],
  ].filter(([, v]) => v);

  return (
    <>
      <Link href="/admin/enquiries" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Enquiries
      </Link>
      {isLoading && <Skeleton className="h-96" />}
      {isError && <Alert>{getErrorMessage(error)}</Alert>}
      {e && (
        <>
          <AdminPageHeader
            title={e.name}
            description={`${e.type === 'QUOTE' ? 'Quote request' : 'Contact message'} · ${formatDate(e.createdAt)}`}
            action={
              <div className="flex gap-2">
                {e.phone && (
                  <a href={customerWhatsapp(e.phone, `Hello ${e.name}, thank you for your enquiry with Meca Trade Link.`)} target="_blank" rel="noopener noreferrer" className={buttonClasses({ variant: 'outline', size: 'sm' })}>
                    <WhatsAppIcon className="h-4 w-4 text-[#25D366]" /> WhatsApp
                  </a>
                )}
                {e.email && <ButtonLink href={`mailto:${e.email}?subject=${encodeURIComponent('Your enquiry with Meca Trade Link')}`} variant="outline" size="sm"><Mail className="h-4 w-4" aria-hidden /> Reply</ButtonLink>}
                {e.phone && <ButtonLink href={`tel:${e.phone}`} variant="outline" size="sm"><Phone className="h-4 w-4" aria-hidden /> Call</ButtonLink>}
              </div>
            }
          />
          <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
            <div className="space-y-6">
              <Card className="p-6">
                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  {rows.map(([k, v]) => (
                    <div key={k}><dt className="text-muted">{k}</dt><dd className="mt-0.5 font-medium">{v}</dd></div>
                  ))}
                </dl>
                {e.message && (
                  <div className="mt-6 border-t border-border pt-5">
                    <h2 className="mb-2 text-sm text-muted">Message</h2>
                    <p className="whitespace-pre-wrap text-sm">{e.message}</p>
                  </div>
                )}
              </Card>
              {e.items.length > 0 && (
                <Card className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-muted">
                        <th className="px-5 py-3 font-medium">Product</th>
                        <th className="px-5 py-3 font-medium">SKU</th>
                        <th className="px-5 py-3 text-right font-medium">Qty</th>
                      </tr>
                    </thead>
                    <tbody>
                      {e.items.map((i) => (
                        <tr key={i.id} className="border-b border-border/60 last:border-0">
                          <td className="px-5 py-3">{i.product ? <Link href={`/products/${i.product.slug}`} target="_blank" className="hover:text-primary">{i.productName}</Link> : <span>{i.productName} <span className="text-xs text-muted">(removed)</span></span>}</td>
                          <td className="px-5 py-3 font-mono text-xs text-muted">{i.product?.sku || '—'}</td>
                          <td className="px-5 py-3 text-right tabular-nums">{i.quantity} {i.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              )}
            </div>

            <FollowUp
              key={e.id}
              enquiry={e}
              onSaved={() => { queryClient.invalidateQueries({ queryKey: ['admin-enquiry', params.id] }); invalidate(); }}
              onDelete={() => window.confirm('Delete this enquiry permanently?') && remove.mutate()}
              deleting={remove.isPending}
            />
          </div>
        </>
      )}
    </>
  );
}
