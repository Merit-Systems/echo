import { convertToModelMessages, streamText, type UIMessage } from 'ai';
import { createX402OpenAI, createX402OpenAIWithoutPayment, UiStreamOnError } from '@merit-systems/ai-x402/server';
import { walletClient } from '../chat-server-wallet/cdp';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const {
    model,
    messages,
    useServerWallet,
  }: {
    messages: UIMessage[];
    model: string;
    useServerWallet: boolean;
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

  if (useServerWallet) {

    // Create OpenAI provider with payment authorization
    const withX402 = createX402OpenAI(
      walletClient 
    );
    // Proceed with actual streaming request
    const result = streamText({
      model: withX402("gpt-5"),
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

  const authHeader = req.headers.get('x-payment');
  // Create OpenAI provider with payment authorization
  const openai = createX402OpenAIWithoutPayment(
    authHeader
  );
  // Proceed with actual streaming request
  const result = streamText({
    model: openai(model),
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
