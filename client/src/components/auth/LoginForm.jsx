'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AuthCard from './AuthCard';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/card';
import { GuestOnly } from '@/components/common/RouteGuard';
import { authService } from '@/services';
import { loginSchema } from '@/lib/schemas';
import { getErrorMessage } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

// Only allow same-site relative paths. Browsers treat "\\" like "/", so "/\\evil.com" is
// protocol-relative too; control characters are rejected for the same reason.
const safeNext = (next) =>
  next && /^\/(?![\/\\])/.test(next) && !/[\\\u0000-\u001f]/.test(next) ? next : null;

export default function LoginForm({ next }) {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [error, setError] = useState(null);
  const [unverified, setUnverified] = useState(null);
  const [notice, setNotice] = useState(null);
  const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values) => {
    setError(null);
    setNotice(null);
    try {
      const user = await login(values);
      router.replace(safeNext(next) || (user.role === 'ADMIN' ? '/admin' : '/account'));
    } catch (err) {
      setUnverified(err.response?.data?.errors?.[0]?.code === 'EMAIL_NOT_VERIFIED');
      setError(getErrorMessage(err));
    }
  };

  const resend = async () => {
    const res = await authService.resendVerification(getValues('email')).catch(() => null);
    setError(null);
    setNotice(res?.message ?? 'If that account needs verification, a new link is on its way.');
  };

  return (
    <GuestOnly>
      <AuthCard
        title="Welcome back"
        description="Log in to track your quote requests."
        footer={<>New to Meca Trade Link? <Link href="/register" className="font-medium text-primary hover:underline">Create an account</Link></>}
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {error && (
            <Alert>
              {error}{' '}
              {unverified && <button type="button" onClick={resend} className="font-medium underline">Resend link</button>}
            </Alert>
          )}
          {notice && <Alert tone="info">{notice}</Alert>}
          <Field label="Email" htmlFor="email" error={errors.email}>
            <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register('email')} />
          </Field>
          <Field label="Password" htmlFor="password" error={errors.password}>
            <Input id="password" type="password" autoComplete="current-password" aria-invalid={!!errors.password} {...register('password')} />
          </Field>
          <div className="text-right">
            <Link href="/forgot-password" className="text-sm text-muted hover:text-primary">Forgot password?</Link>
          </div>
          <Button type="submit" className="w-full" loading={isSubmitting}>Log in</Button>
        </form>
      </AuthCard>
    </GuestOnly>
  );
}
