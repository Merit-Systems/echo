import { appSubpageOgImage } from '@/components/og/images/app';

export default async function Image({ params }: PageProps<'/app/[id]/users'>) {
  const { id } = await params;

  return appSubpageOgImage(id, 'Users');
}
