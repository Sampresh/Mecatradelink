'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AuthCard from './AuthCard';
import { Button, ButtonLink } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/card';
import { authService } from '@/services';
import { resetSchema } from '@/lib/schemas';
import { getErrorMessage } from '@/lib/utils';

export default function ResetPasswordForm() {
  const token = useSearchParams().get('token');
  const [done, setDone] = useState(null);
  const [error, setError] = useState(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(resetSchema) });

  const onSubmit = async ({ password }) => {
    setError(null);
    try {
      setDone((await authService.resetPassword({ token, password })).message);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (!token) {
    return (
      <AuthCard title="Invalid link">
        <Alert>This reset link is missing its token.</Alert>
        <Link href="/forgot-password" className="mt-4 inline-block text-sm text-primary hover:underline">Request a new link</Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Choose a new password">
      {done ? (
        <div className="space-y-4">
          <Alert tone="success">{done}</Alert>
          <ButtonLink href="/login" className="w-full">Log in</ButtonLink>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {error && <Alert>{error}</Alert>}
          <Field label="New password" htmlFor="password" error={errors.password} hint="8+ characters with a letter and a number">
            <Input id="password" type="password" autoComplete="new-password" aria-invalid={!!errors.password} {...register('password')} />
          </Field>
          <Field label="Confirm password" htmlFor="confirmPassword" error={errors.confirmPassword}>
            <Input id="confirmPassword" type="password" autoComplete="new-password" aria-invalid={!!errors.confirmPassword} {...register('confirmPassword')} />
          </Field>
          <Button type="submit" className="w-full" loading={isSubmitting}>Update password</Button>
        </form>
      )}
    </AuthCard>
  );
}
