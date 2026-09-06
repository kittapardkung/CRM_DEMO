import type { Metadata } from 'next';
import { Prompt } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StickyMobileBar from '@/components/StickyMobileBar';
import { dealer } from '@/lib/data/dealer';
import { SITE_URL } from '@/lib/seo';

const prompt = Prompt({
  variable: '--font-prompt',
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'WULING CHONBURI | ศูนย์รถยนต์ไฟฟ้า WULING ชลบุรี',
    template: '%s | WULING CHONBURI',
  },
  description: 'ดูรถ WULING ทุกรุ่น ราคา สเปก โปรโมชั่น และลงทะเบียนทดลองขับที่ชลบุรี',
  openGraph: {
    type: 'website',
    locale: 'th_TH',
    siteName: 'WULING CHONBURI',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
};

const localBusinessJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AutoDealer',
  name: dealer.name,
  telephone: dealer.phoneDisplay,
  email: dealer.email,
  url: SITE_URL,
  areaServed: 'ชลบุรี',
  image: `${SITE_URL}/assets/wuling-chonburi-logo.jpg`,
  address: {
    '@type': 'PostalAddress',
    streetAddress: dealer.addressStreet,
    addressRegion: dealer.addressRegion,
    postalCode: dealer.postalCode,
    addressCountry: 'TH',
  },
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    opens: '08:30',
    closes: '17:00',
  },
  hasMap: dealer.mapsUrl,
  sameAs: [dealer.gbpUrl],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={prompt.variable}>
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Script id="ld-local-business" type="application/ld+json" strategy="beforeInteractive">
          {JSON.stringify(localBusinessJsonLd)}
        </Script>
        <Header />
        <main style={{ flex: '1 0 auto', width: '100%' }}>{children}</main>
        <Footer />
        <StickyMobileBar />
      </body>
    </html>
  );
}
