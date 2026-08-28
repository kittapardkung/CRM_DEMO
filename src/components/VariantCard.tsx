import Link from 'next/link';
import { Vehicle, VehicleVariant } from '@/lib/data/types';
import { money } from '@/lib/format';

/**
 * Pricing / variant card. `recommended` variants get the dealer's
 * highlighted treatment — lime surface, raised, badge — echoing the
 * reference screenshot's "แนะนำ" middle pricing tier.
 */
export default function VariantCard({ vehicle, variant }: { vehicle: Vehicle; variant: VehicleVariant }) {
  const recommended = !!variant.recommended;
  return (
    <article
      className={recommended ? undefined : 'card'}
      style={
        recommended
          ? {
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
              background: 'var(--wl-ink)',
              color: '#fff',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-4)',
              boxShadow: 'var(--shadow-lg)',
              position: 'relative',
              transform: 'translateY(-6px)',
            }
          : { display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }
      }
    >
      {recommended ? (
        <span
          className="tag"
          style={{
            position: 'absolute',
            top: -12,
            left: 'var(--space-4)',
            background: 'var(--wl-lime)',
            color: 'var(--wl-ink)',
            fontWeight: 600,
            letterSpacing: '0.05em',
          }}
        >
          รุ่นแนะนำ
        </span>
      ) : null}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 'var(--space-3)', marginTop: recommended ? 'var(--space-2)' : 0 }}>
        <h3 className="card-title" style={{ margin: 0, fontWeight: 400, color: recommended ? '#fff' : undefined }}>{variant.name}</h3>
        {variant.promotionLabel ? (
          <span className="tag tag-accent-2">{variant.promotionLabel}</span>
        ) : null}
      </div>

      <p className="tnum" style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: 30, color: recommended ? 'var(--wl-lime)' : undefined }}>
        {money(variant.promotionalPrice ?? variant.price)}
      </p>

      <ul style={{ margin: 'var(--space-3) 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {variant.features.map((f) => (
          <li key={f} style={{ fontSize: 15, color: recommended ? 'rgba(255,255,255,0.85)' : 'var(--color-neutral-800)' }}>
            <span style={{ color: recommended ? 'var(--wl-lime)' : 'var(--color-accent-700)' }}>✓</span> {f}
          </li>
        ))}
      </ul>

      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginTop: 'var(--space-4)' }}>
        <Link
          href={`/calculator?price=${variant.promotionalPrice ?? variant.price}`}
          className={recommended ? 'btn btn-on-dark' : 'btn btn-secondary'}
        >
          คำนวณค่างวด
        </Link>
        <Link
          href={`/test-drive?model=${encodeURIComponent(vehicle.name)}&note=${encodeURIComponent('สนใจรุ่นย่อย ' + variant.name)}`}
          className={recommended ? 'btn btn-primary' : 'btn btn-ghost'}
        >
          ขอใบเสนอราคา
        </Link>
      </div>
    </article>
  );
}
