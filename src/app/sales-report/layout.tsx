import type { Metadata } from 'next';
import './report.css';

export const metadata: Metadata = {
  title: 'รีพอร์ตเซลล์รายสัปดาห์',
  robots: { index: false, follow: false },
};

export default function ReportLayout({ children }: { children: React.ReactNode }) {
  return <main className="sr wrap">{children}</main>;
}
