import { cache } from 'react';

import { api } from '@/trpc/server';

export const getIsOwner = cache(async (appId: string) => {
  return await api.apps.app.isOwner(appId);
});
