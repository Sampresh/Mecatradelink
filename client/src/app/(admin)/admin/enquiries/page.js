'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import EnquiryStatusBadge, { ENQUIRY_STATUSES } from '@/components/user/EnquiryStatusBadge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/input';
import { Alert, Badge, Card, Skeleton } from '@/components/ui/card';
import { adminService } from '@/services';
import { formatDate, getErrorMessage } from '@/lib/utils';

function EnquiriesTable() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const params = { status: sp.get('status') || '', type: sp.get('type') || '', page: Number(sp.get('page')) || 1 };

  const setParam = (key, value) => {
    const next = new URLSearchParams(sp);
    value ? next.set(key, value) : next.delete(key);
    if (key !== 'page') next.delete('page');
    router.replace(`${pathname}?${next}`);
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-enquiries', params],
    queryFn: () => adminService.enquiries({ limit: 20, page: params.page, status: params.status || undefined, type: params.type || undefined }),
    placeholderData: keepPreviousData,
  });

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <Select value={params.status} onChange={(e) => setParam('status', e.target.value)} className="sm:w-48" aria-label="Status filter">
          <option value="">All statuses</option>
          {ENQUIRY_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </Select>
        <Select value={params.type} onChange={(e) => setParam('type', e.target.value)} className="sm:w-48" aria-label="Type filter">
          <option value="">All types</option>
          <option value="QUOTE">Quote requests</option>
          <option value="CONTACT">Contact messages</option>
        </Select>
      </div>

      {isError && <Alert className="mb-4">{getErrorMessage(error)}</Alert>}

      <Card className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted">
              <th className="px-4 py-3 font-medium">From</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Received</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={4} className="p-4"><Skeleton className="h-40" /></td></tr>}
            {data?.items.map((e) => (
              <tr key={e.id} className="border-b border-border/60 last:border-0 hover:bg-surface-2/40">
                <td className="px-4 py-3">
                  <Link href={`/admin/enquiries/${e.id}`} className="font-medium hover:text-primary">{e.name}</Link>
                  <p className="text-xs text-muted">{e.company ? `${e.company} · ` : ''}{[e.phone, e.email].filter(Boolean).join(' · ')}</p>
                </td>
                <td className="px-4 py-3">
                  {e.type === 'QUOTE' ? <Badge tone="primary">Quote · {e._count.items}</Badge> : <Badge>Contact</Badge>}
                </td>
                <td className="px-4 py-3 text-muted">{formatDate(e.createdAt)}</td>
                <td className="px-4 py-3"><EnquiryStatusBadge status={e.status} /></td>
              </tr>
            ))}
            {data && !data.items.length && <tr><td colSpan={4} className="px-4 py-12 text-center text-muted">No enquiries.</td></tr>}
          </tbody>
        </table>
      </Card>

      {data?.meta.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <Button variant="outline" size="sm" disabled={params.page <= 1} onClick={() => setParam('page', params.page - 1)}>Previous</Button>
          <span className="text-sm text-muted">Page {params.page} of {data.meta.totalPages}</span>
          <Button variant="outline" size="sm" disabled={params.page >= data.meta.totalPages} onClick={() => setParam('page', params.page + 1)}>Next</Button>
        </div>
      )}
    </>
  );
}

export default function AdminEnquiriesPage() {
  return (
    <>
      <AdminPageHeader title="Enquiries" description="Quote requests and contact messages from the website." />
      <Suspense>
        <EnquiriesTable />
      </Suspense>
    </>
  );
}
