'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle2, ClipboardList, Minus, Plus, Send, Trash2 } from 'lucide-react';
import ContactFields, { contactDefaults } from './ContactFields';
import SendVia from './SendVia';
import { STATIC_MODE } from '@/lib/mode';
import ProductImage from '@/components/catalog/ProductImage';
import { Button, ButtonLink } from '@/components/ui/button';
import { Field, Textarea } from '@/components/ui/input';
import { Alert, Card } from '@/components/ui/card';
import { useQuoteList } from '@/hooks/useQuoteList';
import { enquiryService } from '@/services';
import { quoteSchema } from '@/lib/schemas';
import { getErrorMessage } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { reveal } from '@/lib/motion';

export default function QuoteRequest() {
  const user = useAuthStore((s) => s.user);
  const { items, setQuantity, remove, clear } = useQuoteList();
  const [done, setDone] = useState(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(quoteSchema),
    defaultValues: { ...contactDefaults(user), message: '' },
  });

  useEffect(() => {
    if (user) reset({ ...contactDefaults(user), message: '' });
  }, [user, reset]);

  const mutation = useMutation({
    mutationFn: (body) => enquiryService.quote(body, { lines: items }),
    onSuccess: (res, vars) => {
      // Showcase mode: keep the list until the customer actually sends the message.
      if (res.whatsapp) return setDone(res);
      clear();
      setDone({ message: vars.email ? `${res.message} A copy has been emailed to you.` : res.message });
    },
  });

  const onSubmit = (values) =>
    mutation.mutate({ ...values, items: items.map((i) => ({ productId: i.id, quantity: i.quantity })) });

  if (done?.whatsapp) {
    return (
      <div className="flex flex-col items-center rounded-lg border border-success/30 bg-success/5 px-6 py-14 text-center">
        <CheckCircle2 className="mb-4 h-12 w-12 text-success" aria-hidden />
        <h2 className="text-2xl font-semibold">Your quote request is ready</h2>
        <p className="mt-2 max-w-md text-muted">
          Send the list of {items.length} product{items.length === 1 ? '' : 's'} to our sales team. We&apos;ll reply with prices and availability.
        </p>
        <SendVia whatsapp={done.whatsapp} mailto={done.mailto} onSent={clear} />
        <button onClick={() => setDone(null)} className="mt-4 text-sm text-muted hover:text-foreground">Edit list</button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex flex-col items-center rounded-lg border border-success/30 bg-success/5 px-6 py-16 text-center">
        <CheckCircle2 className="mb-4 h-12 w-12 text-success" aria-hidden />
        <h2 className="text-2xl font-semibold">Quote request sent</h2>
        <p className="mt-2 max-w-md text-muted">{done.message}</p>
        <div className="mt-8 flex gap-3">
          <ButtonLink href="/products" variant="outline">Keep browsing</ButtonLink>
          {user && <ButtonLink href="/account/quotes">View my requests</ButtonLink>}
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="flex flex-col items-center rounded-lg border border-dashed border-border px-6 py-16 text-center">
        <ClipboardList className="mb-4 h-10 w-10 text-muted" aria-hidden />
        <h2 className="text-xl font-semibold">Your quote list is empty</h2>
        <p className="mt-2 max-w-md text-muted">
          Browse the catalogue and tap <span className="text-foreground">Add to quote</span> on the products you need.
          Or send us a free-text request through the <Link href="/contact" className="text-primary hover:underline">contact form</Link>.
        </p>
        <ButtonLink href="/products" className="mt-8">Browse products</ButtonLink>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
      <section aria-labelledby="list-heading">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="list-heading" className="text-lg font-semibold">Products ({items.length})</h2>
          <button onClick={clear} className="text-sm text-muted hover:text-danger">Clear list</button>
        </div>
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} {...reveal()}>
              <Card className="flex items-center gap-4 p-3">
                <ProductImage src={item.imageUrl} alt={item.name} sizes="64px" className="h-16 w-16 shrink-0 rounded-md" />
                <div className="min-w-0 flex-1">
                  <Link href={`/products/${item.slug}`} className="line-clamp-2 text-sm font-medium hover:text-primary">{item.name}</Link>
                  <p className="text-xs text-muted">per {item.unit}</p>
                </div>
                <div className="flex h-9 items-center rounded-md border border-border">
                  <button onClick={() => setQuantity(item.id, item.quantity - 1)} className="grid h-full w-8 place-items-center text-muted hover:text-foreground" aria-label={`Decrease ${item.name}`}>
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => setQuantity(item.id, Number(e.target.value) || 1)}
                    className="h-full w-12 bg-transparent text-center text-sm [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none"
                    aria-label={`Quantity for ${item.name}`}
                  />
                  <button onClick={() => setQuantity(item.id, item.quantity + 1)} className="grid h-full w-8 place-items-center text-muted hover:text-foreground" aria-label={`Increase ${item.name}`}>
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <button onClick={() => remove(item.id)} className="rounded-md p-2 text-muted hover:bg-danger/10 hover:text-danger" aria-label={`Remove ${item.name}`}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </Card>
            </li>
          ))}
        </ul>
        <Link href="/products" className="mt-4 inline-block text-sm text-primary hover:underline">+ Add more products</Link>
      </section>

      <section {...reveal()} aria-labelledby="details-heading">
        <Card className="p-6">
          <h2 id="details-heading" className="mb-5 text-lg font-semibold">Your details</h2>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            {mutation.isError && <Alert>{getErrorMessage(mutation.error)}</Alert>}
            <ContactFields register={register} errors={errors} />
            <Field label="Notes (optional)" htmlFor="message" error={errors.message}>
              <Textarea id="message" rows={3} placeholder="Preferred brands, delivery date, alternatives…" {...register('message')} />
            </Field>
            <Button type="submit" size="lg" loading={mutation.isPending} className="w-full">
              <Send className="h-4 w-4" aria-hidden /> Send quote request
            </Button>
            {!user && !STATIC_MODE && (
              <p className="text-center text-xs text-muted">
                <Link href="/login?next=/quote" className="text-primary hover:underline">Log in</Link> to track your requests in your account.
              </p>
            )}
          </form>
        </Card>
      </section>
    </div>
  );
}
