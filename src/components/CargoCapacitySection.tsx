import Link from 'next/link';
import ImageSlot from './ImageSlot';
import { cargoCapacity } from '@/lib/data/accessories';

const dimensions = [
  { label: 'ความยาว', value: `${cargoCapacity.lengthM} ม.` },
  { label: 'ความกว้างสูงสุด', value: `${cargoCapacity.widthM} ม.` },
  { label: 'ความกว้างระหว่างซุ้มล้อ', value: `${cargoCapacity.wheelArchWidthM} ม.` },
  { label: 'ความสูงใต้หลังคา', value: `${cargoCapacity.heightM} ม.` },
];

const equivalents = [
  { amount: '2', unit: 'พาเลท', detail: 'พาเลทมาตรฐาน 1.0 × 1.2 ม.' },
  { amount: '~80', unit: 'ลัง', detail: 'ลังพลาสติกขนส่ง 60 × 40 × 32 ซม.' },
  { amount: '~60', unit: 'ถัง', detail: 'ถังน้ำดื่ม 20 ลิตร' },
];

const deliveries = [
  { file: 'porta-loading-1.jpg', caption: 'ขนถ่ายสินค้าที่คลังกระจายสินค้า' },
  { file: 'porta-loading-2.jpg', caption: 'เรียงลังเครื่องดื่มเต็มความสูงห้องบรรทุก' },
  { file: 'porta-loading-3.jpg', caption: 'สินค้าอุปโภคบริโภคคละขนาด' },
  { file: 'porta-loading-4.jpg', caption: 'น้ำดื่มและลังกระดาษเต็มคัน' },
];

/** "ขนาดพื้นที่บรรทุก" — real dimensions, capacity equivalents, and a real-deliveries gallery. */
export default function CargoCapacitySection() {
  return (
    <>
      <p className="kicker kicker-2" style={{ margin: '0 0 var(--space-2)', letterSpacing: '0.24em' }}>Cargo Capacity</p>
      <h2 style={{ fontSize: 'clamp(24px,3.2vw,35px)', margin: '0 0 var(--space-3)' }}>ขนาดพื้นที่บรรทุก</h2>
      <p style={{ margin: '0 0 var(--space-6)', maxWidth: '60ch', color: 'var(--color-neutral-800)' }}>
        คำถามที่ลูกค้าสอบถามบ่อยที่สุดคือ &ldquo;บรรทุกอะไรได้บ้าง&rdquo; — PORTA EV มีพื้นที่บรรทุกกว้างขวางถึง 6.5 ลูกบาศก์เมตร พร้อมขนาดพื้นที่บรรทุกที่แน่นอนตามภาพประกอบ
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 'var(--space-6)', alignItems: 'start', marginBottom: 'var(--space-6)' }}>
        <ImageSlot
          aspectRatio="3 / 2"
          caption="ขนาดห้องบรรจุของ WULING PORTA EV: ยาว 2.83 ม. กว้าง 1.65 ม."
          filename="porta-cargo-dimensions.jpg"
          fit="contain"
          style={{ background: 'var(--color-neutral-100)', borderRadius: 'var(--radius-lg)' }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-3)', paddingBottom: 'var(--space-4)', borderBottom: '1px solid var(--color-neutral-300)' }}>
            <p className="tnum" style={{ margin: 0, fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 'clamp(44px,5vw,60px)', lineHeight: 0.9 }}>
              {cargoCapacity.volume}
            </p>
            <div>
              <p style={{ margin: 0, fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-accent-2-700)' }}>m³</p>
              <p style={{ margin: '2px 0 0', fontSize: 15, color: 'var(--color-neutral-800)' }}>ความจุพื้นที่บรรทุกสูงสุด</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3) var(--space-4)' }}>
            {dimensions.map((d) => (
              <div key={d.label}>
                <p style={{ margin: 0, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-neutral-600)' }}>{d.label}</p>
                <p className="tnum" style={{ margin: '2px 0 0', fontSize: 19 }}>{d.value}</p>
              </div>
            ))}
          </div>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--color-neutral-600)' }}>หมายเหตุ: {cargoCapacity.toleranceNote}</p>
        </div>
      </div>

      <div style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-neutral-300)', borderRadius: 'var(--radius-lg)', padding: 'clamp(20px,2.6vw,32px)' }}>
          <p style={{ margin: '0 0 var(--space-4)', fontSize: 13, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-accent-2-700)' }}>พื้นที่นี้ใส่อะไรได้</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 'var(--space-6)' }}>
            {equivalents.map((e) => (
              <div key={e.detail} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <p className="tnum" style={{ margin: 0, fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 32, lineHeight: 1 }}>{e.amount}</p>
                <p style={{ margin: 0, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-neutral-600)' }}>{e.unit}</p>
                <p style={{ margin: '2px 0 0', fontSize: 14, color: 'var(--color-neutral-800)' }}>{e.detail}</p>
              </div>
            ))}
          </div>
          <p style={{ margin: 'var(--space-6) 0 0', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--color-neutral-200)', fontSize: 12, color: 'var(--color-neutral-600)' }}>
            ตัวเลขเป็นการประเมินจากขนาดพื้นที่ ขึ้นอยู่กับวิธีจัดวางและน้ำหนักบรรทุกจริง
          </p>
        </div>

        <div
          style={{
            background: 'var(--color-accent-100)',
            borderRadius: 'var(--radius-lg)',
            padding: 'clamp(20px,3vw,32px)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-4)',
            marginTop: 'var(--space-6)',
          }}
        >
          <div>
            <p style={{ margin: '0 0 4px', fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 20 }}>ยังไม่แน่ใจว่าของคุณใส่ได้ไหม? วัดจริงที่หน้าบ้าน</p>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--color-neutral-700)', maxWidth: '56ch' }}>
              เรานำรถไปให้ทดลองขับถึงบ้านหรือบริษัทของคุณในชลบุรี ศรีราชา พัทยา และอมตะนคร ลองยกของขึ้นจริง วัดขนาดภายในด้วยตัวเอง แล้วค่อยตัดสินใจ
            </p>
          </div>
          <Link href="/test-drive" className="btn btn-primary">นัดทดลองขับ · ทดลองขนของ</Link>
        </div>
      </div>

      <div>
        <p style={{ margin: '0 0 var(--space-2)', fontSize: 13, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-accent-2-700)' }}>Real Deliveries</p>
        <p style={{ margin: '0 0 var(--space-4)', maxWidth: '56ch', fontSize: 15, color: 'var(--color-neutral-800)' }}>
          ตัวอย่างการจัดวางสินค้าจริงจากลูกค้าที่ใช้ PORTA EV วิ่งส่งของทุกวัน — ทั้งขนถ่ายที่คลังและการเรียงสินค้าเต็มพื้นที่บรรทุก
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 'var(--space-3)' }}>
          {deliveries.map((d) => (
            <figure key={d.file} style={{ margin: 0 }}>
              <ImageSlot aspectRatio="4 / 3" caption={d.caption} filename={d.file} />
              <figcaption style={{ margin: 'var(--space-2) 0 0', fontSize: 13, color: 'var(--color-neutral-700)' }}>{d.caption}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </>
  );
}
