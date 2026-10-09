import PageHeader from '@/components/common/PageHeader';
import { buildMetadata } from '@/lib/seo';
import { site } from '@/lib/site';

export const metadata = buildMetadata({ title: 'Privacy Policy', path: '/privacy' });

export default function PrivacyPage() {
  return (
    <>
      <PageHeader title="Privacy policy" crumbs={[{ label: 'Privacy' }]} />
      <article className="container-page prose-content max-w-3xl py-14">
        <p><strong>Last updated:</strong> {new Date().getFullYear()}. Have this reviewed by your legal adviser before launch.</p>
        <h2>Information we collect</h2>
        <p>When you send an enquiry, request a quote or create an account we collect your name, email, phone number, company and location, plus the products and quantities you request.</p>
        <h2>How we use it</h2>
        <ul>
          <li>To respond to enquiries and prepare quotations.</li>
          <li>To manage your account and show your request history.</li>
          <li>To send service emails such as email verification and password resets.</li>
        </ul>
        <p>We do not sell your personal information. We do not use advertising trackers.</p>
        <h2>Cookies</h2>
        <p>We use one essential, httpOnly cookie to keep you signed in. Your quote list is stored in your own browser.</p>
        <h2>Your rights</h2>
        <p>You can ask us to access, correct or delete your data by emailing <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>.</p>
      </article>
    </>
  );
}
