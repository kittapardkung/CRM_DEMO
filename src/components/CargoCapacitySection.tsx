import ImageSlot from './ImageSlot';
import CTASection from './CTASection';
import { cargoCapacity } from '@/lib/data/accessories';

/**
 * Real cargo dimensions + everyday-object equivalents + a real-deliveries
 * gallery — the new "ขนาดบรรทุก" section on the PORTA page.
 */
export default function CargoCapacitySection() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 'var(--space-8)', alignItems: 'center' }}>
        <div>
          <p className="kicker kicker-2">Cargo Capacity</p>
          <h2 style={{ fontSize: 'clamp(24px,3.2vw,35px)', margin: '0 0 var(--space-4)' }}>ขนาดห้องบรรทุก</h2>
          <p className="tnum" style={{ margin: 0, fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 'clamp(48px,6vw,72px)', lineHeight: 1 }}>
            {cargoCapacity.volume}
            <span style={{ fontSize: '0.4em', marginLeft: 8, fontFamily: 'var(--font-body)', color: 'var(--color-accent-700)' }}>{cargoCapacity.volumeUnit}</span>
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 'var(--space-4)', fontSize: 15, color: 'var(--color-neutral-800)' }}>
            <span>ยาว {cargoCapacity.lengthM} ม. · กว้าง {cargoCapacity.widthM} ม. · สูงใต้หลังคา {cargoCapacity.heightM} ม.</span>
            <span>กว้างระหว่างซุ้มล้อ {cargoCapacity.wheelArchWidthM} ม. · น้ำหนักบรรทุกสูงสุด {cargoCapacity.payloadKg.toLocaleString('en-US')} กก.</span>
          </div>
          <p style={{ margin: 'var(--space-3) 0 0', fontSize: 13, color: 'var(--color-neutral-600)' }}>{cargoCapacity.toleranceNote}</p>
        </div>
        <ImageSlot aspectRatio="4 / 3" caption="ภาพขนาดห้องบรรทุกพร้อมเส้นบอกขนาด" filename="porta-cargo-dimensions.jpg" />
      </div>

      <div>
        <p style={{ margin: '0 0 var(--space-3)', fontSize: 15, color: 'var(--color-neutral-800)' }}>เทียบกับของที่ใช้งานจริง (ประเมินจากขนาดพื้นที่)</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 'var(--space-4)' }}>
          {cargoCapacity.equivalents.map((eq) => (
            <div key={eq.item} className="card" style={{ padding: 'var(--space-4)' }}>
              <p className="tnum" style={{ margin: '0 0 6px', fontFamily: 'var(--font-heading)', fontSize: 24 }}>{eq.amount}</p>
              <p style={{ margin: 0, fontSize: 14, color: 'var(--color-neutral-800)' }}>{eq.item}</p>
            </div>
          ))}
        </div>
      </div>

      <CTASection
        heading="อยากวัดพื้นที่จริงกับสินค้าของคุณ?"
        body="ทีมงานนำรถไปให้ทดลองขนของและวัดขนาดภายในที่หน้าบ้านหรือบริษัทของคุณได้"
        primaryLabel="นัดทดลองขนของ"
        showCalculator={false}
        showPhone={false}
      />

      <div>
        <h3 style={{ fontSize: 'clamp(20px,2.4vw,25px)', margin: '0 0 var(--space-4)' }}>ภาพส่งมอบจริง</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 'var(--space-4)' }}>
          {[1, 2, 3, 4].map((n) => (
            <ImageSlot key={n} aspectRatio="4 / 3" caption={`ภาพส่งมอบจริง #${n}`} filename={`porta-real-delivery-${n}.jpg`} />
          ))}
        </div>
      </div>
    </div>
  );
}
