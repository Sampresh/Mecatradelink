import ShowcaseNotice from '@/components/common/ShowcaseNotice';
import { STATIC_MODE } from '@/lib/mode';

export const metadata = { robots: { index: false, follow: false } };

export default function AuthLayout({ children }) {
  if (STATIC_MODE) return <ShowcaseNotice />;
  return (
    <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden px-4 pb-16 pt-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgb(var(--primary)/0.14),transparent_55%)]" />
      <div className="relative w-full max-w-md">{children}</div>
    </section>
  );
}
