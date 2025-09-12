import { getCustomerSpendInfoForApp } from '@/lib/spend-pools/fetch-user-spend';
import { NextResponse } from 'next/server';
import { authRoute } from '../../../_lib/auth-route';
import { appIdSchema } from '@/services/apps/lib/schemas';
import { z } from 'zod';

const getFreeBalanceParamsSchema = z.object({
  echoAppId: appIdSchema,
});

export const GET = authRoute
  .params(getFreeBalanceParamsSchema)
  .handler(async (_, context) => {
    const { echoAppId } = context.params;

    const spendPoolInfo = await getCustomerSpendInfoForApp(
      context.ctx.userId,
      echoAppId
    );

    return NextResponse.json(spendPoolInfo);
  });
