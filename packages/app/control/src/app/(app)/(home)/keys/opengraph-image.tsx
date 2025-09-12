import { ogExports } from '@/components/og/exports';
import { staticPage } from '@/components/og/images/home';

export const { alt, size, contentType } = ogExports('API Keys');

export default async function Image() {
  return staticPage({
    title: 'API Keys',
    description: 'Manage and create API keys to use in Echo apps',
  });
}
