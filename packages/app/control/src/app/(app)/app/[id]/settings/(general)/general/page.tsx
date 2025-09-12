import { GeneralAppSettings } from '../_components';

export default async function GeneralAppSettingsPage({
  params,
}: PageProps<'/app/[id]/settings/general'>) {
  const { id } = await params;

  return <GeneralAppSettings appId={id} />;
}
