import ImageSlot from './ImageSlot';
import { accessories, accessoryGalleryOrder, getAccessory, tradePersonas } from '@/lib/data/accessories';
import { money } from '@/lib/format';

function PersonaIcon({ icon }: { icon: 'truck' | 'wrench' | 'store' }) {
  const common = { viewBox: '0 0 24 24', width: 24, height: 24, fill: 'none', stroke: 'var(--wl-ink)', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
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

/** "เลือกอุปกรณ์ตามสายงาน" persona cards + full accessory photo gallery. */
export default function PortaAccessoryShowcase() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      <div>
        <p className="kicker kicker-2">อุปกรณ์เสริม PORTA</p>
        <h2 style={{ fontSize: 'clamp(24px,3.2vw,35px)', margin: '0 0 var(--space-2)' }}>เลือกอุปกรณ์ตามสายงานของคุณ</h2>
        <p style={{ margin: '0 0 var(--space-6)', maxWidth: '56ch', color: 'var(--color-neutral-800)' }}>
          อุปกรณ์เสริม 7 รายการ จำหน่ายจริง แนะนำตามลักษณะงานที่พบบ่อยที่สุด
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 'var(--space-4)' }}>
          {tradePersonas.map((p) => (
            <div key={p.title} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <PersonaIcon icon={p.icon} />
              <h3 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: 21 }}>{p.title}</h3>
              <p style={{ margin: 0, fontSize: 14, color: 'var(--color-neutral-800)' }}>{p.description}</p>
              <ul style={{ margin: 'var(--space-2) 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {p.accessoryIds.map((id) => {
                  const acc = getAccessory(id);
                  if (!acc) return null;
                  return (
                    <li key={id} style={{ fontSize: 14 }}>
                      <span style={{ color: 'var(--color-accent-700)' }}>✓</span> {acc.name}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: 'clamp(20px,2.4vw,25px)', margin: '0 0 var(--space-4)' }}>อุปกรณ์เสริมทั้งหมด</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 'var(--space-3)' }}>
          {accessoryGalleryOrder.map((id) => {
            const acc = accessories.find((a) => a.id === id);
            if (!acc) return null;
            return (
              <div key={id} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <ImageSlot aspectRatio="1" caption={acc.name} filename={`porta-acc-${acc.id}.jpg`} />
                <p style={{ margin: 0, fontSize: 13, color: 'var(--color-neutral-700)' }}>+ {money(acc.price)}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
