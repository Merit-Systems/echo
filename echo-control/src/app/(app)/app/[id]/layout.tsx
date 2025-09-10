import { Nav } from '../../_components/layout/nav';

import { getApp, getIsOwner } from './_lib/fetch';

import { auth } from '@/auth';

import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: PageProps<'/app/[id]'>): Promise<Metadata> {
  const { id } = await params;

  try {
    const app = await getApp(id);
    return {
      title: {
        default: app.name,
        template: `${app.name} | %s | Echo`,
      },
      description: app.description ?? undefined,
    };
  } catch {
    return {
      title: {
        default: 'App Not Found',
        template: 'App Not Found | %s | Echo',
      },
      description: 'The app you are looking for does not exist.',
    };
  }
}

export default async function AuthenticatedAppLayout({
  children,
  params,
}: LayoutProps<'/app/[id]'>) {
  const { id } = await params;

  try {
    await getApp(id);
  } catch {
    return children;
  }

  const session = await auth();

  const isOwner = session?.user ? await getIsOwner(id) : false;

  return (
    <div className="flex flex-col flex-1">
      <Nav
        tabs={[
          {
            label: 'Overview',
            href: `/app/${id}`,
          },
          ...(isOwner
            ? [
                {
                  label: 'Free Tier',
                  href: `/app/${id}/free-tier` as const,
                },
              ]
            : []),
          {
            label: 'Referrals',
            href: `/app/${id}/referrals`,
          },
          {
            label: 'Keys',
            href: `/app/${id}/keys`,
          },
          {
            label: 'Users',
            href: `/app/${id}/users`,
          },
          {
            label: 'Transactions',
            href: `/app/${id}/transactions`,
          },
          ...(isOwner
            ? [
                {
                  label: 'Settings',
                  href: `/app/${id}/settings` as const,
                  subRoutes: [
                    `/app/${id}/settings/general`,
                    `/app/${id}/settings/monetization`,
                    `/app/${id}/settings/security`,
                  ],
                },
              ]
            : []),
        ]}
      />
      <div className="flex flex-col py-6 md:py-8 flex-1">{children}</div>
    </div>
  );
}
