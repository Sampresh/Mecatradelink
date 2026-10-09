'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MailCheck } from 'lucide-react';
import AuthCard from '@/components/auth/AuthCard';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/card';
import { GuestOnly } from '@/components/common/RouteGuard';
import { authService } from '@/services';
import { registerSchema } from '@/lib/schemas';
import { getErrorMessage } from '@/lib/utils';

export default function RegisterForm() {
  const [sent, setSent] = useState(null);
  const [error, setError] = useState(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(registerSchema) });

  const onSubmit = async ({ confirmPassword, ...values }) => {
    setError(null);
    try {
      const res = await authService.register(values);
      setSent({ email: values.email, message: res.message });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (sent) {
    return (
      <AuthCard title="Check your email">
        <div className="flex flex-col items-center text-center">
          <MailCheck className="mb-4 h-12 w-12 text-primary" aria-hidden />
          <p className="text-muted">We sent a verification link to <span className="text-foreground">{sent.email}</span>. Click it to activate your account.</p>
          <Link href="/login" className="mt-6 text-sm font-medium text-primary hover:underline">Back to log in</Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <GuestOnly>
      <AuthCard
        title="Create your account"
        description="Save your details and track every quote request."
        footer={<>Already have an account? <Link href="/login" className="font-medium text-primary hover:underline">Log in</Link></>}
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {error && <Alert>{error}</Alert>}
          <Field label="Full name" htmlFor="name" error={errors.name}>
            <Input id="name" autoComplete="name" aria-invalid={!!errors.name} {...register('name')} />
          </Field>
          <Field label="Email" htmlFor="email" error={errors.email}>
            <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register('email')} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Phone (optional)" htmlFor="phone" error={errors.phone}>
              <Input id="phone" type="tel" autoComplete="tel" {...register('phone')} />
            </Field>
            <Field label="Company (optional)" htmlFor="company" error={errors.company}>
              <Input id="company" autoComplete="organization" {...register('company')} />
            </Field>
          </div>
          <Field label="Password" htmlFor="password" error={errors.password} hint="8+ characters with a letter and a number">
            <Input id="password" type="password" autoComplete="new-password" aria-invalid={!!errors.password} {...register('password')} />
          </Field>
          <Field label="Confirm password" htmlFor="confirmPassword" error={errors.confirmPassword}>
            <Input id="confirmPassword" type="password" autoComplete="new-password" aria-invalid={!!errors.confirmPassword} {...register('confirmPassword')} />
          </Field>
          <Button type="submit" className="w-full" loading={isSubmitting}>Create account</Button>
          <p className="text-center text-xs text-muted">
            By signing up you agree to our <Link href="/terms" className="underline">terms</Link> and <Link href="/privacy" className="underline">privacy policy</Link>.
          </p>
        </form>
      </AuthCard>
    </GuestOnly>
  );
}
