'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle2, MessageSquareText, Send, X } from 'lucide-react';
import ProductImage from './ProductImage';
import WhatsAppIcon from '@/components/common/WhatsAppIcon';
import { Button, buttonClasses } from '@/components/ui/button';
import { Field, Input, Textarea } from '@/components/ui/input';
import { Alert } from '@/components/ui/card';
import { enquiryService } from '@/services';
import { enquireSchema } from '@/lib/schemas';
import { productMessage, whatsappLink } from '@/lib/site';
import { getErrorMessage } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

function EnquireForm({ product, onDone }) {
  const user = useAuthStore((s) => s.user);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(enquireSchema),
    defaultValues: { name: user?.name ?? '', phone: user?.phone ?? '', email: user?.email ?? '', quantity: 1, message: '' },
  });
  const mutation = useMutation({
    mutationFn: ({ quantity, ...v }) => enquiryService.quote({ ...v, items: [{ productId: product.id, quantity }] }),
    onSuccess: onDone,
  });

  return (
    <form onSubmit={handleSubmit((v) => mutation.mutate(v))} noValidate className="space-y-4">
      {mutation.isError && <Alert>{getErrorMessage(mutation.error)}</Alert>}
      <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
        <Field label="Your name" htmlFor="enq-name" error={errors.name}>
          <Input id="enq-name" autoComplete="name" aria-invalid={!!errors.name} {...register('name')} />
        </Field>
        <Field label={`Quantity (${product.unit})`} htmlFor="enq-qty" error={errors.quantity}>
          <Input id="enq-qty" type="number" min={1} inputMode="numeric" {...register('quantity')} />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Phone / WhatsApp" htmlFor="enq-phone" error={errors.phone}>
          <Input id="enq-phone" type="tel" autoComplete="tel" placeholder="98XXXXXXXX" aria-invalid={!!errors.phone} {...register('phone')} />
        </Field>
        <Field label="Email (optional)" htmlFor="enq-email" error={errors.email}>
          <Input id="enq-email" type="email" autoComplete="email" {...register('email')} />
        </Field>
      </div>
      <Field label="Anything else? (optional)" htmlFor="enq-msg" error={errors.message}>
        <Textarea id="enq-msg" rows={2} placeholder="Brand preference, delivery location, deadline…" {...register('message')} />
      </Field>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="submit" loading={mutation.isPending} className="flex-1">
          <Send className="h-4 w-4" aria-hidden /> Send enquiry
        </Button>
        <a
          href={whatsappLink(productMessage(product))}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClasses({ variant: 'outline', className: 'flex-1 border-[#25D366]/50 hover:border-[#25D366] hover:bg-[#25D366]/10' })}
        >
          <WhatsAppIcon className="h-4 w-4 text-[#25D366]" /> Ask on WhatsApp
        </a>
      </div>
    </form>
  );
}

/** "Enquire Now" button + dialog asking for price/availability of one product. */
export default function EnquireButton({ product, size = 'sm', className, label = 'Enquire Now' }) {
  const dialogRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <Button size={size} className={className} onClick={() => { setSent(null); setOpen(true); }}>
        <MessageSquareText className="h-4 w-4" aria-hidden /> {label}
      </Button>
      <dialog
        ref={dialogRef}
        onClose={close}
        onClick={(e) => e.target === dialogRef.current && close()}
        aria-labelledby={`enq-title-${product.id}`}
        className="m-auto w-[min(100vw-2rem,560px)] rounded-xl border border-border bg-surface p-0 text-foreground shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-sm"
      >
        {open && (
          <div className="p-6">
            <div className="mb-5 flex items-start gap-4">
              <ProductImage src={product.imageUrl} alt="" sizes="64px" className="h-16 w-16 shrink-0 rounded-md" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-wider text-primary">Enquire about</p>
                <h2 id={`enq-title-${product.id}`} className="font-semibold leading-snug">{product.name}</h2>
                {product.model && <p className="text-sm text-muted">{product.model}</p>}
              </div>
              <button onClick={close} className="rounded-md p-1.5 text-muted hover:bg-surface-2 hover:text-foreground" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            {sent ? (
              <div className="flex flex-col items-center py-6 text-center">
                <CheckCircle2 className="mb-3 h-12 w-12 text-success" aria-hidden />
                <h3 className="text-lg font-semibold">Enquiry sent</h3>
                <p className="mt-1 max-w-sm text-sm text-muted">{sent} We&apos;ll get back to you with price and availability.</p>
                <Button variant="secondary" className="mt-6" onClick={close}>Close</Button>
              </div>
            ) : (
              <EnquireForm product={product} onDone={(res) => setSent(res.message)} />
            )}
          </div>
        )}
      </dialog>
    </>
  );
}

