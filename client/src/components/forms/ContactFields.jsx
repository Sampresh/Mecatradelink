import { Field, Input } from '@/components/ui/input';

// Shared name/email/phone/company/location inputs for contact + quote forms.
export default function ContactFields({ register, errors }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Full name" htmlFor="name" error={errors.name}>
        <Input id="name" autoComplete="name" aria-invalid={!!errors.name} {...register('name')} />
      </Field>
      <Field label="Phone / WhatsApp" htmlFor="phone" error={errors.phone} hint="So we can call you back quickly">
        <Input id="phone" type="tel" autoComplete="tel" placeholder="98XXXXXXXX" aria-invalid={!!errors.phone} {...register('phone')} />
      </Field>
      <Field label="Email (optional)" htmlFor="email" error={errors.email}>
        <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register('email')} />
      </Field>
      <Field label="Company (optional)" htmlFor="company" error={errors.company}>
        <Input id="company" autoComplete="organization" {...register('company')} />
      </Field>
      <Field label="Site / delivery location (optional)" htmlFor="location" error={errors.location} className="sm:col-span-2">
        <Input id="location" autoComplete="address-level2" {...register('location')} />
      </Field>
    </div>
  );
}

export const contactDefaults = (user) => ({
  name: user?.name ?? '',
  email: user?.email ?? '',
  phone: user?.phone ?? '',
  company: user?.company ?? '',
  location: '',
});
