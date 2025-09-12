import { createTRPCRouter } from '../../trpc';

import { creatorActivityRouter } from './creator';

export const activityRouter = createTRPCRouter({
  creator: creatorActivityRouter,
});
