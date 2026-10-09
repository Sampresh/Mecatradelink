'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Award, Images, Inbox, Package, Users } from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import EnquiryStatusBadge from '@/components/user/EnquiryStatusBadge';
import { Alert, Card, Skeleton } from '@/components/ui/card';
import { adminService } from '@/services';
import { formatDate, getErrorMessage } from '@/lib/utils';

export default function AdminDashboard() {
  const { data, isLoading, isError, error } = useQuery({ queryKey: ['admin-stats'], queryFn: adminService.stats });

  if (isError) return <Alert>{getErrorMessage(error)}</Alert>;

  const cards = data && [
    { label: 'New enquiries', value: data.newEnquiries, sub: `${data.openEnquiries} open`, icon: Inbox, href: '/admin/enquiries?status=NEW', highlight: data.newEnquiries > 0 },
    {
      label: 'Products', value: data.products, icon: Package, href: '/admin/products',
      sub: `${data.activeProducts} live${data.noPhoto ? ` · ${data.noPhoto} without photo` : ''}`,
    },
    { label: 'Brands', value: data.brands, sub: `${data.categories} categories`, icon: Award, href: '/admin/brands' },
    { label: 'Gallery photos', value: data.gallery, icon: Images, href: '/admin/gallery' },
    { label: 'Customers', value: data.users, sub: 'registered accounts', icon: Users },
  ];

  return (
    <>
      <AdminPageHeader title="Dashboard" description="Overview of enquiries and catalogue." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {isLoading
          ? [0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32" />)
          : cards.map(({ label, value, sub, icon: Icon, href, highlight }) => {
              const body = (
                <Card className={`h-full p-5 transition-colors ${href ? 'hover:border-primary/40' : ''} ${highlight ? 'border-primary/40 bg-primary/5' : ''}`}>
                  <div className="flex items-center justify-between text-muted">
                    <span className="text-sm">{label}</span>
                    <Icon className="h-4 w-4" aria-hidden />
                  </div>
                  <p className="mt-3 text-3xl font-bold tabular-nums">{value}</p>
                  {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
                </Card>
              );
              return href ? <Link key={label} href={href}>{body}</Link> : <div key={label}>{body}</div>;
            })}
      </div>

      <Card className="mt-8 overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-semibold">Latest enquiries</h2>
          <Link href="/admin/enquiries" className="text-sm text-primary hover:underline">View all</Link>
        </div>
        {isLoading ? (
          <div className="p-5"><Skeleton className="h-24" /></div>
        ) : data.recent.length ? (
          <ul className="divide-y divide-border">
            {data.recent.map((e) => (
              <li key={e.id}>
                <Link href={`/admin/enquiries/${e.id}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-surface-2/50">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{e.name} <span className="font-normal text-muted">· {e.company || e.email || e.phone}</span></p>
                    <p className="text-xs text-muted">{e.type === 'QUOTE' ? `Quote · ${e._count.items} items` : 'Contact'} · {formatDate(e.createdAt)}</p>
                  </div>
                  <EnquiryStatusBadge status={e.status} />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-5 py-10 text-center text-sm text-muted">No enquiries yet.</p>
        )}
      </Card>
    </>
  );
}
