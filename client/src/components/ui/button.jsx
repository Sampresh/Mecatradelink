import { forwardRef } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const VARIANTS = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary-hover shadow-[0_0_24px_-6px_rgb(var(--primary)/0.6)]',
  secondary: 'bg-surface-2 text-foreground hover:bg-border',
  outline: 'border border-border bg-transparent text-foreground hover:border-primary/60 hover:bg-primary/5',
  ghost: 'text-muted hover:bg-surface-2 hover:text-foreground',
  danger: 'bg-danger/90 text-white hover:bg-danger',
  light: 'bg-white text-black hover:bg-zinc-200',
};

// Mobile-first: phones get compact (but ≥40px tap-target) buttons; full size from `sm` up.
const SIZES = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 text-sm sm:h-11 sm:px-5',
  lg: 'h-12 px-5 text-sm sm:h-14 sm:px-8 sm:text-base',
  icon: 'h-10 w-10',
};

export const buttonClasses = ({ variant = 'primary', size = 'md', className } = {}) =>
  cn(
    'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50',
    VARIANTS[variant],
    SIZES[size],
    className,
  );

export const Button = forwardRef(function Button(
  { variant, size, className, loading, disabled, children, type = 'button', ...props },
  ref,
) {
  return (
    <button ref={ref} type={type} disabled={disabled || loading} className={buttonClasses({ variant, size, className })} {...props}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
});

export function ButtonLink({ href, variant, size, className, children, ...props }) {
  return (
    <Link href={href} className={buttonClasses({ variant, size, className })} {...props}>
      {children}
    </Link>
  );
}
