import { api } from '@/trpc/server';
import { Body, Heading } from '../../../_components/layout/page-utils';
import { SettingsNav } from './_components/nav';
import { notFound, unauthorized } from 'next/navigation';
import { auth } from '@/auth';

export default async function AppSettingsLayout({
  children,
  params,
}: LayoutProps<'/app/[id]/settings'>) {
  const { id } = await params;

  const session = await auth();

  const owner = await api.apps.app.getOwner(id);

  if (!owner) {
    return notFound();
  }

  if (session?.user.id !== owner.id) {
    return unauthorized();
  }

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
