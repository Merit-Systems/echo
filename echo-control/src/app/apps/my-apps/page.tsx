'use client';

import React from 'react';
import { OwnerEchoApp } from '@/lib/echo-apps/types';
import AllAppsPage from '@/components/AllAppsPage';

const MyAppsFullPage: React.FC = () => {
  const fetchMyApps = async (): Promise<OwnerEchoApp[]> => {
    const response = await fetch('/api/owner/apps');
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch echo apps');
    }

    const allApps = (data.apps || []) as OwnerEchoApp[];
    return allApps; // All apps returned should be OwnerEchoApp since user is the owner
  };

  return (
    <AllAppsPage
      title="Your Apps"
      description="Applications you've created and manage"
      fetchApps={fetchMyApps}
      emptyStateMessage="You haven't created any apps yet."
    />
  );
};

export default MyAppsFullPage;
