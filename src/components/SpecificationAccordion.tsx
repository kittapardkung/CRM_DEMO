import { SpecGroup } from '@/lib/data/types';

/**
 * Full specification accordion (master prompt §11). Built on native
 * <details>/<summary> — no client JS needed, keyboard- and
 * screen-reader-accessible, and every group is in the DOM for SEO even
 * when collapsed.
 */
export default function SpecificationAccordion({ groups }: { groups: SpecGroup[] }) {
  return (
    <div style={{ borderTop: '1px solid var(--color-divider)' }}>
      {groups.map((g, i) => (
        <details key={g.id} open={i === 0} style={{ borderBottom: '1px solid var(--color-divider)' }}>
          <summary
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 'var(--space-3)',
              padding: 'var(--space-4) 0',
              fontFamily: 'var(--font-heading)',
              fontSize: 21,
              cursor: 'pointer',
              listStyle: 'none',
            }}
          >
            <span>{g.title}</span>
          </summary>
          <table className="table" style={{ margin: '0 0 var(--space-4)' }}>
            <tbody>
              {g.rows.map((r) => (
                <tr key={r.label}>
                  <th scope="row" style={{ fontWeight: 400, width: '50%' }}>{r.label}</th>
                  <td>{r.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      ))}
    </div>
  );
}
