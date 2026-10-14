import type { Metadata } from 'next';
import ShowroomExperience from '@/components/showroom/ShowroomExperience';
import { getShowroomData } from '@/lib/showroom/data';

export const metadata: Metadata = {
  title: 'ต้นแบบโชว์รูม 3D (ทดลอง)',
  robots: { index: false, follow: false },
};

export default function ShowroomLabPage() {
  return <ShowroomExperience data={getShowroomData()} />;
}
