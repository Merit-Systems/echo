import { convertToModelMessages, streamText, type UIMessage } from 'ai';
import {
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
      paymentMethod,
    }: {
      messages: UIMessage[];
      model: string;
      paymentMethod?: 'credits' | 'x402';
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

    const shouldUseX402 = paymentMethod === 'x402';
    const result = streamText({
      model: shouldUseX402
        ? createX402OpenAIWithoutPayment({
            paymentAuthHeader: req.headers.get('x-payment'),
            echoAppId: process.env.ECHO_APP_ID,
          })(model)
        : openai(model),
      messages: convertToModelMessages(messages),
      maxRetries: 0,
    });

    return result.toUIMessageStreamResponse({
      sendSources: true,
      sendReasoning: true,
      onError: shouldUseX402 ? UiStreamOnError() : undefined,
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
