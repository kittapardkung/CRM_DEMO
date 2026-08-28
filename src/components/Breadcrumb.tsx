import Link from 'next/link';
import { Fragment } from 'react';

export default function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav style={{ padding: 'var(--space-4) 0', fontSize: 13, color: 'var(--color-neutral-600)' }} aria-label="breadcrumb">
      {items.map((item, i) => (
        <Fragment key={item.label}>
          {i > 0 ? ' / ' : ''}
          {item.href ? <Link href={item.href}>{item.label}</Link> : <span>{item.label}</span>}
        </Fragment>
      ))}
    </nav>
  );
}
