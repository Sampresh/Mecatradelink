'use client';

import { useEffect } from 'react';
import { TriangleAlert } from 'lucide-react';
import { Button, ButtonLink } from '@/components/ui/button';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="container-page flex min-h-[70vh] flex-col items-center justify-center pt-16 text-center">
      <TriangleAlert className="mb-6 h-12 w-12 text-primary" aria-hidden />
      <h1 className="text-3xl font-bold tracking-tight">Something tripped</h1>
      <p className="mt-3 max-w-md text-muted">We couldn&apos;t load this page. Please try again in a moment.</p>
      <div className="mt-8 flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <ButtonLink href="/" variant="outline">Go home</ButtonLink>
      </div>
    </section>
  );
}
