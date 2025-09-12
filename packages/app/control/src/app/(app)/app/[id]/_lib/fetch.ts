import { cache } from 'react';

import { api } from '@/trpc/server';

export const getIsOwner = cache(async (appId: string) => {
  return await api.apps.app.isOwner(appId);
});

export const getApp = cache(async (appId: string) => {
  return await api.apps.app.get({ appId });
});

export const getOverallStats = cache(async (appId: string) => {
  return await api.apps.app.stats.overall({ appId });
});
