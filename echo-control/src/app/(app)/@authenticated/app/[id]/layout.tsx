import { api } from '@/trpc/server';
import { Nav } from '../../_components/layout/nav';
import { getApp } from '@/lib/apps/get-app';

import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: PageProps<'/app/[id]'>): Promise<Metadata> {
  const { id } = await params;
  const app = await getApp(id);
  return {
    title: {
      default: app.name,
      template: `${app.name} | %s | Echo`,
    },
    description: app.description || undefined,
  };
}

export default async function AuthenticatedAppLayout({
  children,
  params,
}: LayoutProps<'/app/[id]'>) {
  const { id } = await params;

  const isOwner = await api.apps.app.isOwner(id);

  const isAdmin = await api.admin.isAdmin();

  const hasAccess = isOwner || isAdmin;

  return (
    <div>
      <Nav
        tabs={[
          {
            label: 'Overview',
            href: `/app/${id}`,
          },
          ...(hasAccess
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
          ...(hasAccess
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
      <div className="flex flex-col py-6 md:py-8">{children}</div>
    </div>
  );
}
