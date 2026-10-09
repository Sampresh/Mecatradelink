import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const base =
  'w-full rounded-lg border border-border bg-surface px-3.5 text-sm text-foreground placeholder:text-muted/70 transition-colors focus:border-primary/70 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60 aria-[invalid=true]:border-danger/70';

export const Input = forwardRef(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cn(base, 'h-11', className)} {...props} />;
});

export const Textarea = forwardRef(function Textarea({ className, rows = 4, ...props }, ref) {
  return <textarea ref={ref} rows={rows} className={cn(base, 'py-3', className)} {...props} />;
});

export const Select = forwardRef(function Select({ className, children, ...props }, ref) {
  return (
    <select ref={ref} className={cn(base, 'h-11 appearance-none pr-8', className)} {...props}>
      {children}
    </select>
  );
});

export function Label({ className, ...props }) {
  return <label className={cn('mb-1.5 block text-sm font-medium text-foreground', className)} {...props} />;
}

/** Label + control + error message. Pass `error` from react-hook-form's formState. */
export function Field({ label, htmlFor, error, hint, className, children }) {
  return (
    <div className={className}>
      {label && <Label htmlFor={htmlFor}>{label}</Label>}
      {children}
      {error ? (
        <p role="alert" className="mt-1.5 text-xs text-danger">{error.message}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}
