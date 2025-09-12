import { appSubpageOgImage } from '@/components/og/images/app';

export default async function Image({ params }: PageProps<'/app/[id]/keys'>) {
  const { id } = await params;

  return appSubpageOgImage(id, 'API Keys');
}
