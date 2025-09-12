import { SettingsNav } from '../_components/nav';

import { GeneralAppSettings } from './_components';

export default async function AppSettingsPage({
  params,
}: PageProps<'/app/[id]/settings'>) {
  const { id } = await params;

  return (
    <>
      <div className="w-full lg:hidden">
        <SettingsNav appId={id} />
      </div>
      <div className="w-full hidden lg:block">
        <GeneralAppSettings appId={id} />
      </div>
    </>
  );
}
