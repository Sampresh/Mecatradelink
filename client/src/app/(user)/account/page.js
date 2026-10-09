'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { Alert, Card } from '@/components/ui/card';
import { userService } from '@/services';
import { setAccessToken } from '@/services/api';
import { profileSchema, changePasswordSchema } from '@/lib/schemas';
import { getErrorMessage } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

function ProfileForm({ user }) {
  const setUser = useAuthStore((s) => s.setUser);
  const [saved, setSaved] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user.name, phone: user.phone ?? '', company: user.company ?? '' },
  });
  const mutation = useMutation({
    mutationFn: userService.updateProfile,
    onSuccess: (u) => { setUser(u); setSaved(true); },
  });

  return (
    <Card className="p-6">
      <h2 className="mb-1 text-lg font-semibold">Profile</h2>
      <p className="mb-5 text-sm text-muted">{user.email}</p>
      <form onSubmit={handleSubmit((v) => { setSaved(false); mutation.mutate(v); })} noValidate className="space-y-4">
        {mutation.isError && <Alert>{getErrorMessage(mutation.error)}</Alert>}
        {saved && <Alert tone="success">Profile saved.</Alert>}
        <Field label="Full name" htmlFor="name" error={errors.name}>
          <Input id="name" {...register('name')} aria-invalid={!!errors.name} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Phone" htmlFor="phone" error={errors.phone}><Input id="phone" type="tel" {...register('phone')} /></Field>
          <Field label="Company" htmlFor="company" error={errors.company}><Input id="company" {...register('company')} /></Field>
        </div>
        <Button type="submit" loading={mutation.isPending}>Save changes</Button>
      </form>
    </Card>
  );
}

function PasswordForm() {
  const [message, setMessage] = useState(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(changePasswordSchema) });
  const mutation = useMutation({
    mutationFn: userService.changePassword,
    onSuccess: (res) => {
      // Server revoked every session and issued a new one for this device.
      setAccessToken(res.data.accessToken);
      setMessage(res.message);
      reset();
    },
  });

  return (
    <Card className="p-6">
      <h2 className="mb-5 text-lg font-semibold">Change password</h2>
      <form
        onSubmit={handleSubmit(({ currentPassword, newPassword }) => { setMessage(null); mutation.mutate({ currentPassword, newPassword }); })}
        noValidate
        className="space-y-4"
      >
        {mutation.isError && <Alert>{getErrorMessage(mutation.error)}</Alert>}
        {message && <Alert tone="success">{message}</Alert>}
        <Field label="Current password" htmlFor="currentPassword" error={errors.currentPassword}>
          <Input id="currentPassword" type="password" autoComplete="current-password" {...register('currentPassword')} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="New password" htmlFor="newPassword" error={errors.newPassword}>
            <Input id="newPassword" type="password" autoComplete="new-password" {...register('newPassword')} />
          </Field>
          <Field label="Confirm new password" htmlFor="confirmPassword" error={errors.confirmPassword}>
            <Input id="confirmPassword" type="password" autoComplete="new-password" {...register('confirmPassword')} />
          </Field>
        </div>
        <Button type="submit" variant="secondary" loading={mutation.isPending}>Update password</Button>
      </form>
    </Card>
  );
}

export default function AccountPage() {
  const user = useAuthStore((s) => s.user);
  return (
    <div className="space-y-6">
      <ProfileForm user={user} />
      <PasswordForm />
    </div>
  );
}
