import { convertToModelMessages, streamText, type UIMessage } from 'ai';
import {
  createX402OpenAI,
  createX402OpenAIWithoutPayment,
  UiStreamOnError,
} from '@merit-systems/ai-x402/server';
import { openai } from '@/echo';

// Allow streaming responses up to 30 seconds
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

    // Validate required parameters
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

    // Check if this is an x402 payment request (wallet-based USDC payment)
    const authHeader = req.headers.get('x-payment');

    if (authHeader) {
      // x402 payment flow — user pays with USDC via connected wallet
      const x402OpenAI = createX402OpenAIWithoutPayment({
        paymentAuthHeader: authHeader,
        baseRouterUrl: process.env.ECHO_ROUTER_URL || 'http://localhost:3070',
        echoAppId: process.env.ECHO_APP_ID,
      });

      const result = streamText({
        model: x402OpenAI(model),
        messages: convertToModelMessages(messages),
        maxRetries: 0,
        maxOutputTokens: 1000,
      });

      return result.toUIMessageStreamResponse({
        headers: {
          'Content-Type': 'text/event-stream',
        },
        onError: UiStreamOnError(),
      });
    }

    // Echo credits flow — standard billing through Echo
    const result = streamText({
      model: openai(model),
      messages: convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse({
      sendSources: true,
      sendReasoning: true,
    });
  } catch (error) {
    const message =
      error instanceof SyntaxError
        ? 'Invalid JSON in request body'
        : 'Internal server error';
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: error instanceof SyntaxError ? 400 : 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
