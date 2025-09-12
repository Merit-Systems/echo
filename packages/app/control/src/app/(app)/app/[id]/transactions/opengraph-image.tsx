import { appSubpageOgImage } from '@/components/og/images/app';

export default async function Image({
  params,
}: PageProps<'/app/[id]/transactions'>) {
  const { id } = await params;

  return appSubpageOgImage(id, 'Transactions');
}
