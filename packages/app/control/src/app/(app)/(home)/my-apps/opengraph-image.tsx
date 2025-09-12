import { ogExports } from '@/components/og/exports';
import { staticPage } from '@/components/og/images/home';

export const { alt, size, contentType } = ogExports('My Apps');

export default async function Image() {
  return staticPage({
    title: 'My Apps',
    description: 'View and manage your Echo apps',
  });
}
