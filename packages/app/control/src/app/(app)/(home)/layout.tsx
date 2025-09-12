import { Nav } from '../_components/layout/nav';

export default function AuthenticatedHomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col flex-1">
      <Nav
        tabs={[
          {
            label: 'Overview',
            href: '/dashboard',
          },
          {
            label: 'Credits',
            href: '/credits',
          },
          {
            label: 'Your Apps',
            href: '/my-apps',
          },
          {
            label: 'Activity',
            href: '/activity',
          },
          {
            label: 'API Keys',
            href: '/keys',
          },
          {
            label: 'Create',
            href: '/new',
          },
        ]}
      />
      <div className="flex flex-col py-6 md:py-8 flex-1">{children}</div>
    </div>
  );
}
