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
import PageIndexNav from '@/components/PageIndexNav';
import PortaAccessoryShowcase from '@/components/PortaAccessoryShowcase';
import CargoCapacitySection from '@/components/CargoCapacitySection';
import VideoEmbed from '@/components/VideoEmbed';
import { vehicles, getVehicle } from '@/lib/data/vehicles';
import { cargoShots, portaVideos } from '@/lib/data/accessories';
import { SITE_URL } from '@/lib/seo';

export function generateStaticParams() {
  return vehicles.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const vehicle = getVehicle(slug);
  if (!vehicle) return {};
  if (vehicle.slug === 'porta') {
    return {
      title: 'WULING PORTA EV รถตู้ทึบไฟฟ้าเพื่อธุรกิจ ราคา 659,000 | ชลบุรี',
      description:
        'PORTA EV รถขนส่งไฟฟ้า ห้องบรรทุก 6.5 ลบ.ม. บรรทุกได้ 2 พาเลท วิ่งไกล 400 กม. ต่อการชาร์จ ราคาเริ่ม 659,000 บาท พร้อมกรุพื้นอลูมิเนียม แร็คหลังคา และแอร์ห้องบรรทุก ทดลองขับถึงที่ ชลบุรี ศรีราชา พัทยา อมตะนคร',
      alternates: { canonical: `/models/${vehicle.slug}` },
    };
  }
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

  const isPorta = vehicle.slug === 'porta';

  const pageIndexItems = [
    { id: 'sec-colors', label: 'สี' },
    { id: 'sec-exterior', label: 'ภายนอก' },
    { id: 'sec-highlights', label: 'ตัวเลขสำคัญ' },
    ...(isPorta ? [{ id: 'sec-cargo', label: 'พื้นที่บรรทุก' }, { id: 'sec-capacity', label: 'ขนาดบรรทุก' }] : []),
    { id: 'sec-interior', label: 'ภายใน' },
    ...(isPorta ? [{ id: 'sec-accessories', label: 'ของแต่ง' }, { id: 'sec-video', label: 'คลิป' }] : []),
    { id: 'sec-variants', label: 'ราคา' },
    { id: 'sec-specs', label: 'สเปก' },
  ];

  const productJsonLd = isPorta
    ? {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Car',
            name: 'WULING PORTA EV',
            brand: { '@type': 'Brand', name: 'WULING' },
            model: 'PORTA EV',
            bodyType: 'Panel Van',
            vehicleConfiguration: 'ตู้ทึบ',
            fuelType: 'Electric',
            vehicleEngine: { '@type': 'EngineSpecification', enginePower: { '@type': 'QuantitativeValue', value: 75, unitCode: 'KWT' } },
            vehicleSeatingCapacity: 2,
            driveWheelConfiguration: 'https://schema.org/RearWheelDriveConfiguration',
            cargoVolume: { '@type': 'QuantitativeValue', value: 6.5, unitCode: 'MTQ' },
            vehicleTransmission: 'Automatic',
            offers: {
              '@type': 'Offer', price: '659000', priceCurrency: 'THB',
              availability: 'https://schema.org/InStock',
              url: `${SITE_URL}/models/porta`,
              seller: { '@type': 'AutoDealer', name: 'WULING CHONBURI', telephone: '+66823247915', areaServed: 'ชลบุรี' },
            },
          },
          {
            '@type': 'FAQPage',
            mainEntity: [
              { '@type': 'Question', name: 'PORTA EV บรรทุกได้เท่าไหร่', acceptedAnswer: { '@type': 'Answer', text: 'ห้องบรรทุกมีความจุสูงสุด 6.5 ลูกบาศก์เมตร ขนาด 2.83 × 1.65 เมตร สูงใต้หลังคา 1.35 เมตร รองรับพาเลทมาตรฐาน 2 พาเลท ลังพลาสติกขนส่งประมาณ 80 ลัง หรือถังน้ำดื่ม 20 ลิตร ประมาณ 60 ถัง' } },
              { '@type': 'Question', name: 'PORTA EV วิ่งได้ไกลเท่าไหร่ต่อการชาร์จ', acceptedAnswer: { '@type': 'Answer', text: 'วิ่งได้ 400 กิโลเมตรต่อการชาร์จ ตามมาตรฐาน CLTC ด้วยแบตเตอรี่ LFP ความจุ 56.9 kWh ติดตั้งกลางตัวรถ' } },
              { '@type': 'Question', name: 'PORTA EV ชาร์จนานแค่ไหน', acceptedAnswer: { '@type': 'Answer', text: 'ชาร์จเร็ว DC ใช้เวลา 30 นาที จาก 30 ถึง 80 เปอร์เซ็นต์ ชาร์จปกติ AC ใช้เวลา 6 ถึง 8 ชั่วโมง หัวชาร์จเป็นแบบ CCS Type 2' } },
              { '@type': 'Question', name: 'PORTA EV รับประกันกี่ปี', acceptedAnswer: { '@type': 'Answer', text: 'รับประกันตัวรถ 3 ปี หรือ 100,000 กิโลเมตร รับประกันแบตเตอรี่และมอเตอร์ 5 ปี หรือ 200,000 กิโลเมตร' } },
              { '@type': 'Question', name: 'PORTA EV ราคาเท่าไหร่', acceptedAnswer: { '@type': 'Answer', text: 'ราคาเริ่มต้น 659,000 บาท สำหรับรุ่น Standard ยังไม่รวมอุปกรณ์เสริม เช่น กรุพื้นอลูมิเนียม แร็คหลังคา บันไดปีนท้ายรถ และแอร์ห้องบรรทุก' } },
            ],
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'หน้าแรก', item: `${SITE_URL}/` },
              { '@type': 'ListItem', position: 2, name: 'รถยนต์ WULING', item: `${SITE_URL}/models` },
              { '@type': 'ListItem', position: 3, name: 'WULING PORTA EV', item: `${SITE_URL}/models/porta` },
            ],
          },
        ],
      }
    : {
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

      <PageIndexNav items={pageIndexItems} />

      <section id="sec-highlights" className="section" style={{ scrollMarginTop: 140 }}>
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

      {isPorta ? (
        <>
          <section id="sec-cargo" className="section" style={{ scrollMarginTop: 140 }}>
            <p className="kicker kicker-2">Cargo</p>
            <h2 style={{ fontSize: 'clamp(24px,3.2vw,35px)', margin: '0 0 var(--space-6)' }}>พื้นที่พร้อมสำหรับธุรกิจของคุณ</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 'var(--space-4)' }}>
              {cargoShots.map((c) => (
                <ImageSlot key={c.filename} aspectRatio="4 / 3" caption={c.label} filename={c.filename} style={{ alignItems: 'flex-end', justifyContent: 'flex-start', textAlign: 'left' }} />
              ))}
            </div>
          </section>

          <section id="sec-capacity" className="section" style={{ scrollMarginTop: 140 }}>
            <CargoCapacitySection />
          </section>
        </>
      ) : null}

      <section id="sec-interior" className="section" style={{ scrollMarginTop: 140 }}>
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

      {isPorta ? (
        <>
          <section id="sec-accessories" className="section" style={{ scrollMarginTop: 140 }}>
            <PortaAccessoryShowcase />
          </section>

          <PortaConfigurator vehicle={vehicle} />

          <BeforeAfterSlider afterCaption="PORTA Customized" afterFile="porta-cargo-configured.webp" />

          <section id="sec-video" className="section" style={{ scrollMarginTop: 140 }}>
            <p className="kicker kicker-2">งานจริง</p>
            <h2 style={{ fontSize: 'clamp(24px,3.2vw,35px)', margin: '0 0 var(--space-6)' }}>คลิปการใช้งานจริงจากลูกค้า</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 'var(--space-4)', maxWidth: 900 }}>
              {portaVideos.map((v) => (
                <VideoEmbed key={v.id} title={v.title} youtubeId={v.youtubeId} />
              ))}
            </div>
          </section>
        </>
      ) : null}

      <section id="sec-variants" className="section" style={{ scrollMarginTop: 140 }}>
        <h2 style={{ fontSize: 'clamp(23px,3vw,32px)', margin: '0 0 var(--space-6)' }}>รุ่นย่อยและราคา</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 'var(--space-4)' }}>
          {vehicle.variants.map((x) => (
            <VariantCard key={x.id} vehicle={vehicle} variant={x} />
          ))}
        </div>
      </section>

      <section id="sec-specs" className="section" style={{ scrollMarginTop: 140 }}>
        <h2 style={{ fontSize: 'clamp(23px,3vw,32px)', margin: '0 0 var(--space-6)' }}>สเปกทั้งหมด</h2>
        <SpecificationAccordion groups={vehicle.specifications} />
        <p style={{ margin: 'var(--space-4) 0 0', fontSize: 13, color: 'var(--color-neutral-600)' }}>
          สเปกอาจแตกต่างกันในแต่ละรุ่นย่อย ข้อมูลทั้งหมดรอยืนยันจากผู้จำหน่ายเว้นแต่ระบุไว้ว่ายืนยันแล้ว
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
