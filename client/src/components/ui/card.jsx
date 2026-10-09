import { cn } from '@/lib/utils';

export function Card({ className, ...props }) {
  return <div className={cn('rounded-lg border border-border bg-surface', className)} {...props} />;
}

export function Badge({ className, tone = 'default', ...props }) {
  const tones = {
    default: 'border-border bg-surface-2 text-muted',
    primary: 'border-primary/30 bg-primary/10 text-primary',
    success: 'border-success/30 bg-success/10 text-success',
    danger: 'border-danger/30 bg-danger/10 text-danger',
    accent: 'border-accent/30 bg-accent/10 text-accent',
  };
  return (
    <span
      className={cn('inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium', tones[tone], className)}
      {...props}
    />
  );
}

export function Alert({ tone = 'danger', className, children }) {
  const tones = {
    danger: 'border-danger/30 bg-danger/10 text-red-200',
    success: 'border-success/30 bg-success/10 text-green-200',
    info: 'border-accent/30 bg-accent/10 text-sky-200',
  };
  return (
    <div role={tone === 'danger' ? 'alert' : 'status'} className={cn('rounded-lg border px-4 py-3 text-sm', tones[tone], className)}>
      {children}
    </div>
  );
}

export function Skeleton({ className }) {
  return <div className={cn('animate-pulse rounded-lg bg-surface-2', className)} />;
}
