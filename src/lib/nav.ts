export const primaryNav = [
  { label: 'หน้าแรก', href: '/' },
  { label: 'รถยนต์', href: '/models' },
  { label: 'Operating Lease', href: '/lease' },
  { label: 'เปรียบเทียบรถ', href: '/compare' },
  { label: 'คำนวณความคุ้มค่า', href: '/savings' },
  { label: 'บทความ', href: '/articles' },
  { label: 'วิดีโอสาระน่ารู้', href: '/videos' },
  { label: 'ศูนย์บริการ', href: '/service' },
  { label: 'ติดต่อเรา', href: '/contact' },
];

export const footerServiceLinks = [
  { label: 'Operating Lease สำหรับองค์กร', href: '/lease' },
  { label: 'เปรียบเทียบรถ', href: '/compare' },
  { label: 'คำนวณค่างวด', href: '/calculator' },
  { label: 'คำนวณความคุ้มค่า', href: '/savings' },
  { label: 'ทดลองขับ', href: '/test-drive' },
  { label: 'บทความ', href: '/articles' },
  { label: 'วิดีโอสาระน่ารู้', href: '/videos' },
  { label: 'พื้นที่ให้บริการ', href: '/areas' },
  { label: 'ติดต่อเรา', href: '/contact' },
];

/** Homepage quick-link rail, in the design's order. */
export const quickLinks = [
  { label: 'คำนวณความคุ้มค่า', href: '/savings' },
  { label: 'คำนวณค่างวด', href: '/calculator' },
  { label: 'เปรียบเทียบรถทุกรุ่น', href: '/compare' },
  { label: 'ศูนย์บริการและนัดหมาย', href: '/service' },
  { label: 'Operating Lease สำหรับองค์กร', href: '/lease' },
];

/** Given a pathname, which top-nav item should read as active. */
export function isNavActive(href: string, pathname: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(href + '/');
}

/**
 * Resolves an article CTA/link's logical `goRoute` (as authored in the
 * content data — 'contact' | 'testdrive' | 'lease' | 'calculator' |
 * 'compare' | 'service' | 'areas' | 'porta', or a bare vehicle slug) into
 * a real route.
 */
export function ctaHref(goRoute: string): string {
  switch (goRoute) {
    case 'contact':
      return '/contact';
    case 'testdrive':
    case 'test-drive':
      return '/test-drive';
    case 'lease':
      return '/lease';
    case 'calculator':
      return '/calculator';
    case 'savings':
      return '/savings';
    case 'compare':
      return '/compare';
    case 'service':
      return '/service';
    case 'areas':
      return '/areas';
    case 'models':
      return '/models';
    case 'porta':
      return '/models/porta';
    default:
      return `/models/${goRoute}`;
  }
}
