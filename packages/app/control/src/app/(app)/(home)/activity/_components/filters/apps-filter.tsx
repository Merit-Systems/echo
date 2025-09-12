'use client';

import { AppSelect } from '@/app/(app)/_components/apps/select';
import { useFiltersContext } from '../../contexts/filters-context';

export const AppsFilter = () => {
  const { appId, setAppId } = useFiltersContext();

  return (
    <AppSelect
      selectedAppId={appId ?? ''}
      setSelectedAppId={setAppId}
      placeholder="All Apps"
      role="owner"
      clearable
    />
  );
};
