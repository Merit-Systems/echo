import { getAppOwner } from '@/services/apps/get';
import { protectedProcedure, publicProcedure } from '../../trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { appIdSchema } from '@/services/apps/lib/schemas';
import { getApp } from '@/services/apps/get';
import { db } from '@/lib/db';

const appIdInput = z.object({ appId: appIdSchema });

export const publicAppProcedure = publicProcedure
  .input(appIdInput)
  .use(async ({ input: { appId }, next, ctx }) => {
    const app = await getApp(appId);
    if (!app) {
      throw new TRPCError({ code: 'NOT_FOUND' });
    }
    return next({ ctx: { ...ctx, app } });
  });

export const protectedAppProcedure = protectedProcedure
  .input(appIdInput)
  .use(async ({ next, input: { appId }, ctx }) => {
    const app = await getApp(appId);
    if (!app) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'App not found' });
    }
    return next({ ctx: { ...ctx, app } });
  });

export const appOwnerProcedure = protectedProcedure
  .input(appIdInput)
  .use(async ({ input: { appId }, ctx, next }) => {
    const appOwner = await getAppOwner(appId);
    if (!appOwner) {
      throw new TRPCError({ code: 'NOT_FOUND' });
    }
    
    // Check if user is global admin or the actual owner
    const user = await db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: { admin: true },
    });

    if (!user?.admin && appOwner.id !== ctx.session.user.id) {
      throw new TRPCError({ code: 'FORBIDDEN' });
    }
    
    return next({ ctx: { ...ctx, appOwner } });
  });
