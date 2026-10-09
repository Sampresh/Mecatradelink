import { Card } from '@/components/ui/card';
import BrandMark from '@/components/common/BrandMark';
import { reveal } from '@/lib/motion';

export default function AuthCard({ title, description, children, footer }) {
  return (
    <Card {...reveal('soft')} className="p-6 shadow-2xl shadow-black/40 sm:p-8">
      <BrandMark size={56} className="mb-5 h-14 w-14" />
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      {description && <p className="mt-1.5 text-sm text-muted">{description}</p>}
      <div className="mt-6">{children}</div>
      {footer && <div className="mt-6 border-t border-border pt-5 text-center text-sm text-muted">{footer}</div>}
    </Card>
  );
}
