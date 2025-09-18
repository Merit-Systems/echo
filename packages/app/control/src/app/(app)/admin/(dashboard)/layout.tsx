import { Nav } from '@/app/(app)/_components/layout/nav';

export default async function AdminLayout({ children }: LayoutProps<'/admin'>) {
  return (
    <div className="flex flex-col flex-1">
      <Nav
        tabs={[
          {
            label: 'Overview',
            href: '/admin',
          },
          {
            label: 'Credit Grants',
            href: '/admin/credit-grants',
            subRoutes: ['/admin/credit-grants/new'],
          },
          {
            label: 'Payouts',
            href: '/admin/payouts',
          },
          {
            label: 'User Earnings',
            href: '/admin/user-earnings',
          },
          {
            label: 'User Spending',
            href: '/admin/user-spending',
          },
          {
            label: 'App Earnings',
            href: '/admin/app-earnings',
          },
          {
            label: 'Payments',
            href: '/admin/payments',
          },
        ]}
      />
      <div className="flex flex-col py-6 md:py-8 flex-1">{children}</div>
    </div>
  );
}
