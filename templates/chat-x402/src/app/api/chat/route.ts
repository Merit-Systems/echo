import { convertToModelMessages, streamText, type UIMessage } from 'ai';
import { openai } from '@/echo';

const ALLOWED_MODELS = ['gpt-4o', 'gpt-5'];

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const {
      model,
      messages,
    }: {
      messages: UIMessage[];
      model: string;
    } = await req.json();

    if (!model) {
      return new Response(
        JSON.stringify({
          error: 'Bad Request',
          message: 'Model parameter is required',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (!ALLOWED_MODELS.includes(model)) {
      return new Response(
        JSON.stringify({
          error: 'Bad Request',
          message: 'Model is not allowed',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({
          error: 'Bad Request',
          message: 'Messages parameter is required and must be an array',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const useX402 = req.headers.get('use-x402') === 'true';
    const paymentHeader = req.headers.get('x-payment');
    const payTo = process.env.X402_PAY_TO_ADDRESS;
    const asset = process.env.X402_ASSET_ADDRESS;

    if (!payTo || !asset) {
      return new Response(
        JSON.stringify({
          error: 'Server configuration error',
          message: 'x402 payment is not configured',
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (useX402 && !paymentHeader) {
      return new Response(
        JSON.stringify({
          x402Version: 1,
          accepts: [
            {
              scheme: 'exact',
              description: 'Payment required for chat completion',
              network: 'base',
              maxAmountRequired: '10000',
              resource: '/api/chat',
              mimeType: 'application/json',
              payTo,
              maxTimeoutSeconds: 60,
              asset,
              outputSchema: null,
              extra: null,
            },
          ],
        }),
        {
          status: 402,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // TODO: Validate x-payment header with your payment processor in production.
    const result = streamText({
      model: openai(model),
      messages: convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse({
      sendSources: true,
      sendReasoning: true,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: 'Failed to process chat request',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
