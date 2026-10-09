'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import ProductForm from '@/components/admin/ProductForm';

export default function NewProductPage() {
  return (
    <>
      <Link href="/admin/products" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Products
      </Link>
      <AdminPageHeader title="New product" />
      <ProductForm />
    </>
  );
}
