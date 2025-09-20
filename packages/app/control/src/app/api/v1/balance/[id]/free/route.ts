import { getCustomerSpendInfoForApp } from '@/lib/spend-pools/fetch-user-spend';
import { NextResponse } from 'next/server';
import { authRoute } from '../../../../../../lib/api/auth-route';
import { appIdSchema } from '@/services/apps/lib/schemas';
import { z } from 'zod';

const getFreeBalanceParamsSchema = z.object({
  id: appIdSchema,
});

export const GET = authRoute
  .params(getFreeBalanceParamsSchema)
  .handler(async (_, context) => {
    const { id } = context.params;

    const spendPoolInfo = await getCustomerSpendInfoForApp(
      context.ctx.userId,
      id
    );

    return NextResponse.json(spendPoolInfo);
  });
