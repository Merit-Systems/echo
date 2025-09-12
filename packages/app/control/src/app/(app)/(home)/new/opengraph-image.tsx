import { ogExports } from '@/components/og/exports';
import { staticPage } from '@/components/og/images/home';

export const { alt, size, contentType } = ogExports('New App');

export default async function Image() {
  return staticPage({
    title: 'New App',
    description: 'Create a new Echo app to start earning on LLM requests',
  });
}
