/** Real dealer contact info, confirmed by the dealer (2026-09). */
export const dealer = {
  name: 'WULING CHONBURI',
  /** Thai transliteration of the brand — customers search this spelling as often as "WULING". */
  alternateName: 'วู่หลิง ชลบุรี',
  /** Cities/region already promised test-drive delivery to (see PORTA metadata) — kept as one source of truth. */
  serviceAreas: ['ชลบุรี', 'ภาคตะวันออก', 'ศรีราชา', 'พัทยา', 'อมตะนคร'],
  phoneDisplay: '082-324-7915',
  phoneHref: 'tel:0823247915',
  lineUrl: 'https://lin.ee/ZSQFaMd',
  email: 'justiceauto.sa@gmail.com',
  address: 'ถนนบายพาส ชลบุรี ตำบลนาป่า อำเภอเมืองชลบุรี จังหวัดชลบุรี 20000',
  addressStreet: 'ถนนบายพาส ชลบุรี ตำบลนาป่า อำเภอเมืองชลบุรี',
  addressRegion: 'ชลบุรี',
  postalCode: '20000',
  /** Showroom pin coordinates, confirmed by the dealer from the GBP map. */
  latitude: 13.3795129862833,
  longitude: 101.01978779414407,
  hours: 'เปิดบริการทุกวัน 08:30–17:00 น.',
  siteUrl: 'https://wulingjtgroup.com',
  /** Google Business Profile short link — used as sameAs in structured data. */
  gbpUrl: 'https://share.google/YLW3gDhz6dfzp6kZY',
  /** Real showroom pin — used for the "navigate here" link (no API key needed). */
  mapsUrl: 'https://maps.app.goo.gl/96HHoHDMUTiYHAwF7',
  facebookUrl: 'https://www.facebook.com/profile.php?id=61583789612737',
};

export const contactRows = [
  { label: 'โทรศัพท์', value: dealer.phoneDisplay, href: dealer.phoneHref },
  { label: 'LINE', value: 'เพิ่มเพื่อนทาง LINE', href: dealer.lineUrl },
  { label: 'ที่ตั้งโชว์รูม', value: dealer.address, href: dealer.mapsUrl },
  { label: 'เวลาทำการ', value: dealer.hours },
  { label: 'อีเมล', value: dealer.email, href: `mailto:${dealer.email}` },
];
