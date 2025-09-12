import { ogExports } from '@/components/og/exports';
import { staticPage } from '@/components/og/images/home';

export const { alt, size, contentType } = ogExports('Creator Earnings');

export default async function Image() {
  return staticPage({
    title: 'Creator Earnings',
    description: 'View and claim your app markup earnings.',
  });
}
