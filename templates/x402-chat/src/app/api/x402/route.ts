import { NextRequest, NextResponse } from 'next/server';

import { paymentMiddleware } from 'x402-next';

// THIS is completely a dummy route to test the client's ability to hit the x402 route
// to actually access echo LLM resources, you need to hit the actual echo router.
export async function GET(request: NextRequest) {
  const pathname = `/api/x402`;
  const toAddress = '0x0000000000000000000000000000000000000000';

  const middleware = paymentMiddleware(toAddress, {
    [pathname]: {
      price: '0.001',
      config: { description: `Basic x402 test for ${pathname}` },
      network: 'base',
    },
  });

  const response = await middleware(request);
  if (response.status === 402) {
    return response;
  }

  // if we got here, we have paid the troll toll

  return NextResponse.json({
    message: 'You have paid the troll toll, the password is "jeebus"',
  });
}
