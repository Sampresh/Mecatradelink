'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import ProductForm from '@/components/admin/ProductForm';
import { ButtonLink } from '@/components/ui/button';
import { Alert, Skeleton } from '@/components/ui/card';
import { adminService } from '@/services';
import { getErrorMessage } from '@/lib/utils';

export default function EditProductPage() {
  const params = useParams();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-product', params.id],
    queryFn: () => adminService.product(params.id),
  });

  return (
    <>
      <Link href="/admin/products" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Products
      </Link>
      <AdminPageHeader
        title={data?.name ?? 'Edit product'}
        action={data?.isActive && (
          <ButtonLink href={`/products/${data.slug}`} variant="outline" size="sm" target="_blank">
            View on site <ExternalLink className="h-4 w-4" aria-hidden />
          </ButtonLink>
        )}
      />
      {isLoading && <Skeleton className="h-96" />}
      {isError && <Alert>{getErrorMessage(error)}</Alert>}
      {data && <ProductForm key={data.id} product={data} />}
    </>
  );
}
