'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle2, Send } from 'lucide-react';
import ContactFields, { contactDefaults } from './ContactFields';
import { Button } from '@/components/ui/button';
import { Field, Textarea } from '@/components/ui/input';
import { Alert } from '@/components/ui/card';
import { enquiryService } from '@/services';
import { contactSchema } from '@/lib/schemas';
import { getErrorMessage } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

export default function ContactForm() {
  const user = useAuthStore((s) => s.user);
  const [done, setDone] = useState(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: { ...contactDefaults(user), message: '' },
  });

  useEffect(() => {
    if (user) reset({ ...contactDefaults(user), message: '' });
  }, [user, reset]);

  const mutation = useMutation({
    mutationFn: enquiryService.contact,
    onSuccess: (res) => setDone(res.message),
  });

  if (done) {
    return (
      <div className="flex flex-col items-center rounded-lg border border-success/30 bg-success/5 px-6 py-14 text-center">
        <CheckCircle2 className="mb-4 h-12 w-12 text-success" aria-hidden />
        <h2 className="text-xl font-semibold">Message sent</h2>
        <p className="mt-2 max-w-sm text-muted">{done}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit((v) => mutation.mutate(v))} noValidate className="space-y-4">
      {mutation.isError && <Alert>{getErrorMessage(mutation.error)}</Alert>}
      <ContactFields register={register} errors={errors} />
      <Field label="How can we help?" htmlFor="message" error={errors.message}>
        <Textarea id="message" rows={5} aria-invalid={!!errors.message} placeholder="Products you need, quantities, brands, timeline…" {...register('message')} />
      </Field>
      <Button type="submit" size="lg" loading={mutation.isPending} className="w-full sm:w-auto">
        <Send className="h-4 w-4" aria-hidden /> Send message
      </Button>
    </form>
  );
}
