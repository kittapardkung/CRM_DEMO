import type { Metadata } from 'next';
import CompareTool from '@/components/CompareTool';

export const metadata: Metadata = {
  title: 'เปรียบเทียบรถยนต์ WULING',
  description: 'เปรียบเทียบราคา สเปก และฟีเจอร์ของรถยนต์ WULING แต่ละรุ่น',
  alternates: { canonical: '/compare' },
};

export default function ComparePage() {
  return (
    <div className="wrap">
      <CompareTool />
    </div>
  );
}
