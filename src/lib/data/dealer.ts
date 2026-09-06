import { PLACEHOLDER } from './types';

/** The one confirmed piece of real dealer contact info; everything else is unconfirmed. */
export const dealer = {
  name: 'WULING CHONBURI',
  phoneDisplay: '082-324-7915',
  phoneHref: 'tel:0823247915',
  line: PLACEHOLDER,
  address: `${PLACEHOLDER} (จังหวัดชลบุรี)`,
  hours: PLACEHOLDER,
  email: PLACEHOLDER,
  siteUrl: 'https://wulingjtgroup.com',
};

export const contactRows = [
  { label: 'โทรศัพท์', value: dealer.phoneDisplay },
  { label: 'LINE', value: dealer.line },
  { label: 'ที่ตั้งโชว์รูม', value: dealer.address },
  { label: 'เวลาทำการ', value: dealer.hours },
  { label: 'อีเมล', value: dealer.email },
];
