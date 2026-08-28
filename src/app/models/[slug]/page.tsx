import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Breadcrumb from '@/components/Breadcrumb';
import ImageSlot from '@/components/ImageSlot';
import VehicleVisuals from '@/components/VehicleVisuals';
import VariantCard from '@/components/VariantCard';
import SpecificationAccordion from '@/components/SpecificationAccordion';
import CTASection from '@/components/CTASection';
import PortaConfigurator from '@/components/PortaConfigurator';
import BeforeAfterSlider from '@/components/BeforeAfterSlider';
import { vehicles, getVehicle } from '@/lib/data/vehicles';
import { cargoShots } from '@/lib/data/accessories';
import { SITE_URL } from '@/lib/seo';

export function generateStaticParams() {
  return vehicles.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const vehicle = getVehicle(slug);
  if (!vehicle) return {};
  return {
    title: `${vehicle.name} | ราคาและสเปก`,
    description: `${vehicle.name} ${vehicle.tagline} ดูราคา รุ่นย่อย สี และสเปกทั้งหมด`,
    alternates: { canonical: `/models/${vehicle.slug}` },
  };
}

export default async function ModelDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const vehicle = getVehicle(slug);
  if (!vehicle) notFound();

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Vehicle',
    name: vehicle.name,
    description: vehicle.tagline,
    vehicleConfiguration: vehicle.vehicleType,
    url: `${SITE_URL}/models/${vehicle.slug}`,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'THB',
      price: vehicle.startingPrice,
      availability: 'https://schema.org/InStock',
    },
  };

  return (
    <div className="wrap">
      <Breadcrumb items={[{ label: 'หน้าแรก', href: '/' }, { label: 'รถยนต์', href: '/models' }, { label: vehicle.shortName }]} />

      <VehicleVisuals vehicle={vehicle} />

      <section className="section">
        <h2 style={{ fontSize: 'clamp(23px,3vw,32px)', margin: '0 0 var(--space-6)' }}>ตัวเลขสำคัญ</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 'var(--space-6)' }}>
          {vehicle.highlights.map((h) => (
            <div key={h.label}>
              <p className="tnum" style={{ margin: 0, fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 'clamp(36px,4.4vw,54px)', lineHeight: 1 }}>{h.value}</p>
              <p style={{ margin: 'var(--space-2) 0 0', fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-accent-700)' }}>{h.unit}</p>
              <p style={{ margin: '4px 0 0', fontSize: 15, color: 'var(--color-neutral-800)' }}>{h.label}</p>
            </div>
          ))}
        </div>
      </section>

      {vehicle.isConfigurable ? (
        <>
          <section className="section">
            <p className="kicker kicker-2">Cargo</p>
            <h2 style={{ fontSize: 'clamp(24px,3.2vw,35px)', margin: '0 0 var(--space-6)' }}>พื้นที่พร้อมสำหรับธุรกิจของคุณ</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 'var(--space-4)' }}>
              {cargoShots.map((c) => (
                <div key={c.filename} style={{ position: 'relative' }}>
                  <ImageSlot aspectRatio="4 / 3" caption={c.label} filename={c.filename} style={{ alignItems: 'flex-end', justifyContent: 'flex-start', textAlign: 'left' }} />
                  {c.hasDimensionOverlay ? (
                    <span
                      style={{
                        position: 'absolute',
                        top: 'var(--space-3)',
                        left: 'var(--space-3)',
                        border: '1px solid var(--color-accent-2)',
                        color: 'var(--color-accent-2-700)',
                        fontSize: 11,
                        padding: '2px 8px',
                        letterSpacing: '0.1em',
                        background: '#fff',
                      }}
                      className="tnum"
                    >
                      DIMENSION OVERLAY · XXX × XXX × XXX mm
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          </section>

          <PortaConfigurator vehicle={vehicle} />

          <BeforeAfterSlider afterCaption="PORTA Customized" afterFile="porta-cargo-configured.webp" />
        </>
      ) : null}

      <section className="section">
        <h2 style={{ fontSize: 'clamp(23px,3vw,32px)', margin: '0 0 var(--space-6)' }}>ภายใน</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: 'var(--space-4)' }}>
          {vehicle.interiorViews.map((i) => (
            <ImageSlot
              key={i.slug}
              aspectRatio="4 / 3"
              caption={i.label}
              filename={`${vehicle.slug}-interior-${i.slug}.webp`}
              style={{ alignItems: 'flex-end', justifyContent: 'flex-start', textAlign: 'left' }}
            />
          ))}
        </div>
      </section>

      <section className="section">
        <h2 style={{ fontSize: 'clamp(23px,3vw,32px)', margin: '0 0 var(--space-6)' }}>รุ่นย่อยและราคา</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 'var(--space-4)' }}>
          {vehicle.variants.map((x) => (
            <VariantCard key={x.id} vehicle={vehicle} variant={x} />
          ))}
        </div>
      </section>

      <section className="section">
        <h2 style={{ fontSize: 'clamp(23px,3vw,32px)', margin: '0 0 var(--space-6)' }}>สเปกทั้งหมด</h2>
        <SpecificationAccordion groups={vehicle.specifications} />
        <p style={{ margin: 'var(--space-4) 0 0', fontSize: 13, color: 'var(--color-neutral-600)' }}>
          สเปกอาจแตกต่างกันในแต่ละรุ่นย่อย ข้อมูลทั้งหมดรอยืนยันจากผู้จำหน่าย
        </p>
      </section>

      <section style={{ padding: 'var(--space-6) 0 var(--space-8)' }}>
        <CTASection heading={`สนใจ ${vehicle.shortName}?`} />
      </section>

      <script
        type="application/ld+json"
         
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
    </div>
  );
}
