import { ogExports } from '@/components/og/exports';
import { staticPage } from '@/components/og/images/home';

export const { alt, size, contentType } = ogExports('My Apps');

export default async function Image() {
  return staticPage({
    title: 'Docs',
    description: 'Monetize your AI App in Minutes',
  });
}
