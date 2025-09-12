import { ogExports } from '@/components/og/exports';
import { staticPage } from '@/components/og/images/home';

export const { alt, size, contentType } = ogExports('Credits');

export default async function Image() {
  return staticPage({
    title: 'Credits',
    description:
      'Echo credits can be used to make LLM requests on any Echo app',
  });
}
