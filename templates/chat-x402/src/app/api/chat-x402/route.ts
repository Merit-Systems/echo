import { anthropic, openai } from '@/echo';
import { x402 } from '@merit-systems/echo-aix402';

export async function POST(req: Request) {
  const { messages, paymentMethod } = await req.json();

  // x402 payment verification
  if (paymentMethod === 'usdc') {
    const paymentVerified = await x402.verifyPayment(req);
    if (!paymentVerified) {
      return new Response(
        JSON.stringify({ error: 'Payment required', status: 402 }),
        {
          status: 402,
          headers: {
            'Content-Type': 'application/json',
            'x402-payment-required': 'true',
            'x402-accept': 'usdc',
            'x402-amount': '0.01',
            'x402-network': 'base',
          },
        }
      );
    }
  }

  // Use Echo-billed AI providers
  const result = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages,
  });

  return result.toDataStreamResponse();
}
