import localFont from 'next/font/local';
import '@/styles/globals.css';
import Providers from '@/components/common/Providers';
import SiteShell from '@/components/common/SiteShell';
import Footer from '@/components/common/Footer';
import WhatsAppFloat from '@/components/common/WhatsAppFloat';
import { site } from '@/lib/site';
import { jsonLdHtml, organizationJsonLd } from '@/lib/seo';

const geistSans = localFont({ src: './fonts/GeistVF.woff', variable: '--font-geist-sans', weight: '100 900', display: 'swap' });
const geistMono = localFont({ src: './fonts/GeistMonoVF.woff', variable: '--font-geist-mono', weight: '100 900', display: 'swap' });

export const metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | Electrical Products & Materials Supplier`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  keywords: [
    'electrical supplier', 'electrical products', 'modular switches', 'switch sockets', 'electrical wires',
    'cables', 'LED bulbs', 'LED panel lights', 'MCB', 'distribution board', 'electrical accessories', 'electrical tools',
  ],
  openGraph: { siteName: site.name, type: 'website', locale: 'en_US' },
  twitter: { card: 'summary_large_image' },
};

export const viewport = { themeColor: '#09090b' };

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="font-sans">
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml(organizationJsonLd())} />
        <Providers>
          <SiteShell footer={<Footer />}>{children}</SiteShell>
          <WhatsAppFloat />
        </Providers>
      </body>
    </html>
  );
}
