import type { Metadata } from 'next';
import { Prompt } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StickyMobileBar from '@/components/StickyMobileBar';
import { dealer } from '@/lib/data/dealer';
import { GA_MEASUREMENT_ID, SITE_URL } from '@/lib/seo';

const prompt = Prompt({
  variable: '--font-prompt',
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'WULING CHONBURI | ตัวแทนจำหน่ายวู่หลิง ชลบุรี ภาคตะวันออก',
    template: '%s | WULING CHONBURI',
  },
  description: 'ตัวแทนจำหน่ายวู่หลิง (WULING) อย่างเป็นทางการ ประจำชลบุรีและภาคตะวันออก ดูรถทุกรุ่น ราคา สเปก โปรโมชั่น และลงทะเบียนทดลองขับ',
  openGraph: {
    type: 'website',
    locale: 'th_TH',
    siteName: 'WULING CHONBURI',
    images: [`${SITE_URL}/assets/wuling-chonburi-logo.jpg`],
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
  alternateName: dealer.alternateName,
  telephone: dealer.phoneDisplay,
  email: dealer.email,
  url: SITE_URL,
  areaServed: dealer.serviceAreas,
  image: `${SITE_URL}/assets/wuling-chonburi-logo.jpg`,
  address: {
    '@type': 'PostalAddress',
    streetAddress: dealer.addressStreet,
    addressRegion: dealer.addressRegion,
    postalCode: dealer.postalCode,
    addressCountry: 'TH',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: dealer.latitude,
    longitude: dealer.longitude,
  },
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    opens: '08:30',
    closes: '17:00',
  },
  hasMap: dealer.mapsUrl,
  sameAs: [dealer.gbpUrl, dealer.facebookUrl],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={prompt.variable}>
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/*
          A plain literal <script> tag (not next/script strategy="beforeInteractive"),
          so crawlers that only fetch raw HTML — not all of them execute JS, notably
          several AEO/GEO answer-engine crawlers — can read the sitewide NAP/AutoDealer
          schema without waiting on client-side hydration.
        */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
        <Script strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
        <Header />
        <main style={{ flex: '1 0 auto', width: '100%' }}>{children}</main>
        <Footer />
        <StickyMobileBar />
      </body>
    </html>
  );
}
