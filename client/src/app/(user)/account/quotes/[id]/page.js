'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import EnquiryStatusBadge from '@/components/user/EnquiryStatusBadge';
import { Alert, Card, Skeleton } from '@/components/ui/card';
import { userService } from '@/services';
import { formatDate, getErrorMessage } from '@/lib/utils';

export default function MyQuoteDetailPage() {
  const params = useParams();
  const { data: e, isLoading, isError, error } = useQuery({
    queryKey: ['my-enquiry', params.id],
    queryFn: () => userService.myEnquiry(params.id),
  });

  return (
    <div>
      <Link href="/account/quotes" className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
        <ArrowLeft className="h-4 w-4" aria-hidden /> All requests
      </Link>
      {isLoading && <Skeleton className="h-64" />}
      {isError && <Alert>{getErrorMessage(error)}</Alert>}
      {e && (
        <Card className="p-6">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-semibold">{e.type === 'QUOTE' ? 'Quote request' : 'Message'}</h2>
            <EnquiryStatusBadge status={e.status} />
            <span className="ml-auto text-sm text-muted">{formatDate(e.createdAt)}</span>
          </div>
          {e.items.length > 0 && (
            <table className="mt-6 w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted">
                  <th className="pb-2 font-medium">Product</th>
                  <th className="pb-2 text-right font-medium">Quantity</th>
                </tr>
              </thead>
              <tbody>
                {e.items.map((i) => (
                  <tr key={i.id} className="border-b border-border/60">
                    <td className="py-3">
                      {i.product ? <Link href={`/products/${i.product.slug}`} className="hover:text-primary">{i.productName}</Link> : i.productName}
                    </td>
                    <td className="py-3 text-right">{i.quantity} {i.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {e.message && (
            <div className="mt-6">
              <h3 className="mb-1 text-sm font-medium text-muted">Your note</h3>
              <p className="whitespace-pre-wrap text-sm">{e.message}</p>
            </div>
          )}
          <p className="mt-6 text-sm text-muted">Our sales team will contact you at {[e.phone, e.email].filter(Boolean).join(' or ')}.</p>
        </Card>
      )}
    </div>
  );
}
