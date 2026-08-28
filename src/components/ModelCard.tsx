import Link from 'next/link';
import ImageSlot from './ImageSlot';
import { Vehicle } from '@/lib/data/types';
import { money } from '@/lib/format';

export default function ModelCard({ vehicle }: { vehicle: Vehicle }) {
  return (
    <article className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', padding: 0, overflow: 'hidden' }}>
      <ImageSlot
        aspectRatio="16 / 11"
        caption={`${vehicle.shortName} · Exterior Front 3/4`}
        filename={`${vehicle.slug}-front-34.webp`}
        style={{ borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none' }}
      />
      <div style={{ padding: '0 var(--space-4) var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <p className="card-kicker" style={{ margin: 0 }}>{vehicle.positioning}</p>
        <h3 className="card-title" style={{ margin: 0, fontSize: 26, fontWeight: 400 }}>{vehicle.shortName}</h3>
        <p className="card-body" style={{ margin: 0 }}>{vehicle.tagline}</p>
        <p style={{ margin: 'var(--space-2) 0 0', fontSize: 15, color: 'var(--color-neutral-800)' }}>
          เริ่มต้น <b className="tnum" style={{ fontWeight: 600 }}>{money(vehicle.startingPrice)}</b>
        </p>
        <Link href={`/models/${vehicle.slug}`} className="btn btn-secondary" style={{ marginTop: 'var(--space-3)', alignSelf: 'flex-start' }}>
          ดูรายละเอียด
        </Link>
      </div>
    </article>
  );
}
