'use client';

import React from 'react';
import AppPreviewList from './AppPreviewList';
import { useMemberApps } from '@/hooks/useMemberApps';

export const MemberApps: React.FC = () => {
  const { memberApps, loading, error } = useMemberApps();

  return (
    <AppPreviewList
      title="Apps I'm Using"
      description="Applications where you have membership access"
      apps={memberApps}
      href="/apps/member-apps"
      loading={loading}
      error={error}
      emptyStateMessage="No member apps found"
    />
  );
};

export default MemberApps;
