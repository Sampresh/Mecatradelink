'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AuthCard from '@/components/auth/AuthCard';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/card';
import { authService } from '@/services';
import { emailSchema } from '@/lib/schemas';
import { getErrorMessage } from '@/lib/utils';

export default function ForgotPasswordForm() {
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(emailSchema) });

  const onSubmit = async ({ email }) => {
    setError(null);
    try {
      setMessage((await authService.forgotPassword(email)).message);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <AuthCard
      title="Reset your password"
      description="Enter your email and we'll send you a reset link."
      footer={<Link href="/login" className="font-medium text-primary hover:underline">Back to log in</Link>}
    >
      {message ? (
        <Alert tone="success">{message}</Alert>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {error && <Alert>{error}</Alert>}
          <Field label="Email" htmlFor="email" error={errors.email}>
            <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register('email')} />
          </Field>
          <Button type="submit" className="w-full" loading={isSubmitting}>Send reset link</Button>
        </form>
      )}
    </AuthCard>
  );
}
