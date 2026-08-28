export const primaryNav = [
  { label: 'หน้าแรก', href: '/' },
  { label: 'รถยนต์', href: '/models' },
  { label: 'โปรโมชั่น', href: '/promotions' },
  { label: 'เปรียบเทียบรถ', href: '/compare' },
  { label: 'บทความ', href: '/articles' },
  { label: 'ศูนย์บริการ', href: '/service' },
  { label: 'ติดต่อเรา', href: '/contact' },
];

export const footerServiceLinks = [
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
