import { Body, Heading } from '../../../_components/layout/page-utils';
import { SettingsNav } from './_components/nav';

import type { Metadata } from 'next';
import { checkAppExists, checkIsAppOwner } from '../_lib/checks';
import { userOrRedirectLayout } from '@/auth/user-or-redirect';

export const metadata: Metadata = {
  title: 'Settings',
};

export default async function AppSettingsLayout({
  children,
  params,
}: LayoutProps<'/app/[id]/settings'>) {
  const { id } = await params;

  await userOrRedirectLayout(`/app/${id}/settings`);
  await checkAppExists(id);
  await checkIsAppOwner(id);

  return (
    <div>
      <Heading title="App Settings" />
      <Body>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="lg:w-[240px] lg:sticky lg:top-0">
            <SettingsNav appId={id} />
          </div>
          <div className="flex-1 flex flex-col gap-6">{children}</div>
        </div>
      </Body>
    </div>
  );
}
