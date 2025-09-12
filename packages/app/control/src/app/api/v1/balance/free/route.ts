import { getCustomerSpendInfoForApp } from '@/lib/spend-pools/fetch-user-spend';
import { NextResponse } from 'next/server';
import { authRoute } from '../../_lib/auth-route';
import { appIdSchema } from '@/services/apps/lib/schemas';
import { z } from 'zod';

const getFreeBalanceSchema = z.object({
  echoAppId: appIdSchema,
});

export const POST = authRoute
  .body(getFreeBalanceSchema)
  .handler(async (_, context) => {
    const { echoAppId } = context.body;

    const spendPoolInfo = await getCustomerSpendInfoForApp(
      context.ctx.userId,
      echoAppId
    );

    return NextResponse.json(spendPoolInfo);
  });
