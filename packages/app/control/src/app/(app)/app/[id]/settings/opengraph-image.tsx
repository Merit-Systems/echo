import { appSubpageOgImage } from '@/components/og/images/app';

export default async function Image({
  params,
}: PageProps<'/app/[id]/settings'>) {
  const { id } = await params;

  return appSubpageOgImage(id, 'Settings');
}
