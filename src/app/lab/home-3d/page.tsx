import type { Metadata } from 'next';
import Home3DExperience from '@/components/home3d/Home3DExperience';
import { resolveAsset } from '@/lib/assets';
import { dealer } from '@/lib/data/dealer';
import { services } from '@/lib/data/services';
import { getVehicle } from '@/lib/data/vehicles';

export const metadata: Metadata = {
  title: 'ต้นแบบหน้าแรก 3D — เมือง ศูนย์บริการ โชว์รูม (ทดลอง)',
  robots: { index: false, follow: false },
};

export default function Home3DLabPage() {
  return (
    <Home3DExperience
      data={{
        logo: resolveAsset('wuling-chonburi-logo.jpg'),
        phoneDisplay: dealer.phoneDisplay,
        phoneHref: dealer.phoneHref,
        lineUrl: dealer.lineUrl,
        hours: dealer.hours,
        address: dealer.address,
        mapsUrl: dealer.mapsUrl,
        colors: getVehicle('darion')!.colors.map((c) => ({ name: c.name, code: c.code })),
        services: services.map((s) => ({ title: s.title, body: s.body })),
      }}
    />
  );
}
