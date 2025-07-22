'use client';

import React from 'react';
import AppPreviewList from './AppPreviewList';
import { useMyApps } from '@/hooks/useMyApps';

export const MyApps: React.FC = () => {
  const { userApps, loading, error } = useMyApps();

  return (
    <AppPreviewList
      title="Your Apps"
      description="Applications you've created and manage"
      apps={userApps}
      href="/apps/my-apps"
      loading={loading}
      error={error}
      emptyStateMessage="You haven't created any apps yet"
    />
  );
};

export default MyApps;
