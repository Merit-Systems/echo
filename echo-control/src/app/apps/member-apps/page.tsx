'use client';

import React from 'react';
import { CustomerEchoApp } from '@/lib/echo-apps/types';
import AllAppsPage from '@/components/AllAppsPage';

const MemberAppsFullPage: React.FC = () => {
  const fetchMemberApps = async (): Promise<CustomerEchoApp[]> => {
    const response = await fetch('/api/apps');
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch echo apps');
    }

    const allApps = (data.apps || []) as CustomerEchoApp[];
    return allApps.sort(
      (a: CustomerEchoApp, b: CustomerEchoApp) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  return (
    <AllAppsPage
      title="Apps I'm Using"
      description="Applications where you have membership access"
      fetchApps={fetchMemberApps}
      emptyStateMessage="No member apps found."
    />
  );
};

export default MemberAppsFullPage;
