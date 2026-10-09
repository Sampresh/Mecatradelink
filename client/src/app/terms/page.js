import PageHeader from '@/components/common/PageHeader';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({ title: 'Terms of Use', path: '/terms' });

export default function TermsPage() {
  return (
    <>
      <PageHeader title="Terms of use" crumbs={[{ label: 'Terms' }]} />
      <article className="container-page prose-content max-w-3xl py-14">
        <p><strong>Last updated:</strong> {new Date().getFullYear()}. Have this reviewed by your legal adviser before launch.</p>
        <h2>Product information</h2>
        <p>Product images and specifications are for guidance. Always confirm ratings and compatibility for your installation. Electrical work should be carried out by a qualified electrician.</p>
        <h2>Quotations</h2>
        <p>Submitting a quote request does not create an order. Prices, stock and delivery are confirmed in our written quotation, which is valid for the period stated on it.</p>
        <h2>Accounts</h2>
        <p>You are responsible for keeping your login details secure. We may suspend accounts that misuse the service.</p>
        <h2>Liability</h2>
        <p>To the extent permitted by law, we are not liable for indirect losses arising from use of this website.</p>
      </article>
    </>
  );
}
