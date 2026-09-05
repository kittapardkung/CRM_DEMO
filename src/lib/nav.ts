export const primaryNav = [
  { label: 'หน้าแรก', href: '/' },
  { label: 'รถยนต์', href: '/models' },
  { label: 'Operating Lease', href: '/lease' },
  { label: 'โปรโมชั่น', href: '/promotions' },
  { label: 'เปรียบเทียบรถ', href: '/compare' },
  { label: 'บทความ', href: '/articles' },
  { label: 'ศูนย์บริการ', href: '/service' },
  { label: 'ติดต่อเรา', href: '/contact' },
];

export const footerServiceLinks = [
  { label: 'Operating Lease สำหรับองค์กร', href: '/lease' },
  { label: 'โปรโมชั่น', href: '/promotions' },
  { label: 'เปรียบเทียบรถ', href: '/compare' },
  { label: 'คำนวณค่างวด', href: '/calculator' },
  { label: 'ทดลองขับ', href: '/test-drive' },
  { label: 'บทความ', href: '/articles' },
  { label: 'ติดต่อเรา', href: '/contact' },
];

/** Given a pathname, which top-nav item should read as active. */
export function isNavActive(href: string, pathname: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(href + '/');
}

/**
 * Resolves an article CTA/link's logical `goRoute` (as authored in the
 * content data — 'contact' | 'testdrive' | 'lease' | 'calculator' |
 * 'compare' | 'porta', or a bare vehicle slug) into a real route.
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
    case 'compare':
      return '/compare';
    case 'models':
      return '/models';
    case 'porta':
      return '/models/porta';
    default:
      return `/models/${goRoute}`;
  }
}
