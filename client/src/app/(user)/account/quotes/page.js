'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, ClipboardList } from 'lucide-react';
import EnquiryStatusBadge from '@/components/user/EnquiryStatusBadge';
import { Button, ButtonLink } from '@/components/ui/button';
import { Alert, Card, Skeleton } from '@/components/ui/card';
import { userService } from '@/services';
import { formatDate, getErrorMessage } from '@/lib/utils';

export default function MyQuotesPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['my-enquiries', page],
    queryFn: () => userService.myEnquiries({ page, limit: 10 }),
    placeholderData: (prev) => prev,
  });

  if (isLoading) return <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-20" />)}</div>;
  if (isError) return <Alert>{getErrorMessage(error)}</Alert>;

  if (!data.items.length) {
    return (
      <Card className="flex flex-col items-center px-6 py-14 text-center">
        <ClipboardList className="mb-4 h-10 w-10 text-muted" aria-hidden />
        <h2 className="text-lg font-semibold">No requests yet</h2>
        <p className="mt-1 text-sm text-muted">Quote requests and messages you send while logged in appear here.</p>
        <ButtonLink href="/products" className="mt-6">Browse products</ButtonLink>
      </Card>
    );
  }

  return (
    <div>
      <ul className="space-y-3">
        {data.items.map((e) => (
          <li key={e.id}>
            <Link href={`/account/quotes/${e.id}`} className="block">
              <Card className="flex items-center gap-4 p-4 transition-colors hover:border-primary/40">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{e.type === 'QUOTE' ? 'Quote request' : 'Message'}</span>
                    <EnquiryStatusBadge status={e.status} />
                  </div>
                  <p className="mt-1 truncate text-sm text-muted">
                    {formatDate(e.createdAt)} · {e.items.length ? `${e.items.length} product${e.items.length > 1 ? 's' : ''}` : e.message}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted" aria-hidden />
              </Card>
            </Link>
          </li>
        ))}
      </ul>
      {data.meta.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <span className="text-sm text-muted">Page {page} of {data.meta.totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= data.meta.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
