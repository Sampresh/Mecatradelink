import PageHeader from '@/components/common/PageHeader';
import QuoteRequest from '@/components/forms/QuoteRequest';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Request a Quote',
  description: 'Send your electrical products list to Meca Trade Link and get pricing and availability within one business day.',
  path: '/quote',
});

export default function QuotePage() {
  return (
    <>
      <PageHeader
        eyebrow="Quote request"
        title="Request a quote"
        description="Review your list, adjust quantities and send it to our sales team. No payment is taken online."
        crumbs={[{ label: 'Quote' }]}
      />
      <div className="container-page py-12">
        <QuoteRequest />
      </div>
    </>
  );
}
