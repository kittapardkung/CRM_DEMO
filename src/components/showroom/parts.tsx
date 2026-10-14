/** Operating Lease highlights — wording and terms come from the existing lease page data (36 / 48 / 60 months). */
export function LeaseFacts({ dark = false }: { dark?: boolean }) {
  const items = [
    'โปรแกรมเช่าระยะยาวสำหรับนิติบุคคล',
    'สัญญาเช่า 36 / 48 / 60 เดือน',
    'ประกันภัยและบริการดูแลรถ ตามเงื่อนไขของสัญญา',
    'ขอใบเสนอราคาตามจำนวนรถและระยะทางใช้งาน',
  ];
  return (
    <ul style={{ margin: 0, paddingLeft: '1.1em', display: 'grid', gap: 6, color: dark ? 'rgba(255,255,255,0.85)' : undefined }}>
      {items.map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ul>
  );
}
