'use client';

import { useRouter } from 'next/navigation';
import { UserEarningsTable } from '@/app/(app)/@authenticated/admin/_components';

export default function AdminEarningsDashboard() {
  const router = useRouter();

  const handleAppClick = (appId: string) => {
    router.push(`/admin/apps/${appId}`);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Earnings Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Comprehensive view of user earnings and transaction aggregates across
          all apps
        </p>
      </div>
      <UserEarningsTable onAppClick={handleAppClick} />
    </div>
  );
}
