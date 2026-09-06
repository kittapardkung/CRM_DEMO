import Link from 'next/link';
import { accessories, accessoryGalleryOrder, getAccessory, tradePersonas } from '@/lib/data/accessories';

function PersonaIcon({ icon }: { icon: 'truck' | 'wrench' | 'store' }) {
  const common = {
    viewBox: '0 0 24 24',
    width: 24,
    height: 24,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  if (icon === 'truck') {
    return (
      <svg {...common}>
        <rect x="1" y="7" width="13" height="9" rx="1" />
        <path d="M14 10h4l3 3v3h-7z" />
        <circle cx="6" cy="18" r="2" />
        <circle cx="17.5" cy="18" r="2" />
      </svg>
    );
  }
  if (icon === 'wrench') {
    return (
      <svg {...common}>
        <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4l-6.6 6.6 2.6 2.6 6.6-6.6a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.6-2.6z" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M3 9l1.5-5h15L21 9" />
      <path d="M4 9v10h16V9" />
      <path d="M4 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 5 2" />
      <path d="M9.5 19v-5h5v5" />
    </svg>
  );
}

/** "Design Your Own PORTA" — accessory photo gallery + trade persona cards + quote CTA. */
export default function PortaAccessoryShowcase() {
  return (
    <>
      <p className="kicker kicker-2" style={{ margin: '0 0 var(--space-2)', letterSpacing: '0.24em' }}>Design Your Own PORTA</p>
      <h2 style={{ fontSize: 'clamp(23px,2.9vw,31px)', margin: '0 0 var(--space-4)' }}>พร้อมช่วยออกแบบ PORTA ให้ตรงกับงานของคุณ</h2>
      <p style={{ margin: '0 0 var(--space-6)', maxWidth: '60ch', color: 'var(--color-neutral-800)' }}>
        อุปกรณ์เสริมแต่ละชิ้นตอบโจทย์การใช้งานต่างกัน — เลือกลักษณะงานที่ใกล้เคียงที่สุด แล้วทีมขายจะช่วยจัดสเปกและเสนอราคาให้ตรงกับธุรกิจของคุณ
      </p>

      <p style={{ margin: '0 0 var(--space-4)', fontSize: 13, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-neutral-600)' }}>
        อุปกรณ์เสริมทั้งหมด
      </p>
      <div className="om-acc-grid" style={{ marginBottom: 'var(--space-8)' }}>
        {accessoryGalleryOrder.map((id) => {
          const acc = accessories.find((a) => a.id === id);
          if (!acc) return null;
          return (
            <div
              key={id}
              style={{
                border: '1px solid var(--color-neutral-300)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                background: 'var(--color-surface)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  aspectRatio: '4 / 3',
                  background: 'var(--color-neutral-200)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  padding: 'var(--space-2)',
                  fontSize: 11,
                  color: 'var(--color-neutral-600)',
                }}
              >
                รอภาพประกอบ
              </div>
              <p style={{ margin: 0, padding: 'var(--space-3)', fontSize: 14, color: 'var(--color-neutral-800)' }}>{acc.name}</p>
            </div>
          );
        })}
      </div>

      <p className="kicker kicker-2" style={{ margin: 'var(--space-6) 0 var(--space-2)', letterSpacing: '0.24em' }}>Built For Every Trade</p>
      <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 'clamp(21px,2.4vw,27px)', margin: '0 0 var(--space-6)' }}>ตอบโจทย์ทุกสายอาชีพ</h3>
      <div className="om-trade-grid" style={{ marginBottom: 'var(--space-6)' }}>
        {tradePersonas.map((p) => (
          <div
            key={p.title}
            style={{
              border: '1px solid var(--color-neutral-300)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-4)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-4)',
              background: 'var(--color-surface)',
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-accent-100)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-accent-700)',
              }}
            >
              <PersonaIcon icon={p.icon} />
            </div>
            <div>
              <p style={{ margin: '0 0 4px', fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 19 }}>{p.title}</p>
              <p style={{ margin: 0, fontSize: 14, color: 'var(--color-neutral-700)' }}>{p.description}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, borderTop: '1px solid var(--color-neutral-200)', paddingTop: 'var(--space-3)' }}>
              {p.accessoryIds.map((id) => {
                const acc = getAccessory(id);
                if (!acc) return null;
                return (
                  <p key={id} style={{ margin: 0, fontSize: 14, color: 'var(--color-neutral-800)' }}>✓ {acc.name}</p>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          background: 'var(--color-accent-2-100)',
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
          <p style={{ margin: '0 0 4px', fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 20 }}>สนใจจัดสเปกให้ตรงกับงานของคุณ?</p>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--color-neutral-700)' }}>
            แจ้งลักษณะงานและอุปกรณ์ที่ต้องการ ทีมขายจะช่วยจัดสเปกและเสนอราคาให้
          </p>
        </div>
        <Link href="/test-drive?note=%E0%B8%82%E0%B8%AD%E0%B9%83%E0%B8%9A%E0%B9%80%E0%B8%AA%E0%B8%99%E0%B8%AD%E0%B8%A3%E0%B8%B2%E0%B8%84%E0%B8%B2%20PORTA%20EV" className="btn btn-primary">
          สนใจ ขอใบเสนอราคา
        </Link>
      </div>
    </>
  );
}
