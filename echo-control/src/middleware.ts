import { createPathMatcher } from 'next-path-matcher';

import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';

import type { Address } from 'viem';
import type { Network } from 'x402-next';
import { paymentMiddleware } from 'x402-next';
import { facilitator } from '@coinbase/x402';

import { middleware } from '@/auth/middleware';
import {
  formatAmountFromQueryParams,
  formatPriceForMiddleware,
} from '@/lib/base';

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
  runtime: 'nodejs',
};

export const x402MiddlewareGenerator = (req: NextRequest) => {
  const amount = formatAmountFromQueryParams(req);

  if (!amount) {
    return async () => {
      return NextResponse.json({ error: `Invalid amount` }, { status: 400 });
    };
  }

  const paymentAmount = formatPriceForMiddleware(amount);

  return paymentMiddleware(
    process.env.RESOURCE_WALLET_ADDRESS as Address,
    {
      '/api/v1/base/payment-link': {
        price: paymentAmount,
        network: process.env.NETWORK as Network,
        config: {
          description: 'Access to protected content',
        },
      },
    },
    facilitator,
    {
      appName: 'Echo Credits',
    }
  );
};

const isX402Route = createPathMatcher(['/api/v1/base/(.*)']);

export default middleware(req => {
  if (isX402Route(req)) {
    // For OPTIONS requests on x402 routes, pass to the next auth handler
    if (req.method === 'OPTIONS') {
      return NextResponse.next();
    }

    const paymentMiddleware = x402MiddlewareGenerator(req);
    return paymentMiddleware(req);
  }

  return NextResponse.next();
});
