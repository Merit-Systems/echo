import { api } from '@/trpc/server';
import { Nav } from '../../_components/layout/nav';

export default async function AuthenticatedAppLayout({
  children,
  params,
}: LayoutProps<'/app/[id]'>) {
  const { id } = await params;

  const isOwner = await api.apps.app.isOwner(id);

  return (
    <div>
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
      <div className="flex flex-col py-4 md:py-6">{children}</div>
    </div>
  );
}
