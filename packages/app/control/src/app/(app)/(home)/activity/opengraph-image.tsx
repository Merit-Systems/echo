import { ogExports } from '@/components/og/exports';
import { staticPage } from '@/components/og/images/home';

export const { alt, size, contentType } = ogExports('Activity');

export default async function Image() {
  return staticPage({
    title: 'Activity',
    description: "See what's happening with your apps",
  });
}
