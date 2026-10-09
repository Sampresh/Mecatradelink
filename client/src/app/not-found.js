import { Unplug } from 'lucide-react';
import { ButtonLink } from '@/components/ui/button';

export const metadata = { title: 'Page not found' };

export default function NotFound() {
  return (
    <section className="container-page flex min-h-[70vh] flex-col items-center justify-center pt-16 text-center">
      <Unplug className="mb-6 h-14 w-14 text-primary" aria-hidden />
      <p className="font-mono text-sm text-primary">404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">This circuit isn&apos;t connected</h1>
      <p className="mt-3 max-w-md text-muted">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
      <div className="mt-8 flex gap-3">
        <ButtonLink href="/">Go home</ButtonLink>
        <ButtonLink href="/products" variant="outline">Browse products</ButtonLink>
      </div>
    </section>
  );
}
