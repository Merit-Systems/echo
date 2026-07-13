import { convertToModelMessages, streamText } from 'ai';
import {
  createX402OpenAIWithoutPayment,
  UiStreamOnError,
} from '@merit-systems/ai-x402/server';
import { openai, getEchoToken } from '@/echo';

export const maxDuration = 30;

async function validateAuthentication(useX402: boolean): Promise<{
  token?: string | null;
  error?: Response;
}> {
  if (useX402) {
    return {};
  }

  try {
    const token = await getEchoToken();
    if (!token) {
      return {
        error: new Response(
          JSON.stringify({ error: 'Authentication failed' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        ),
      };
    }
    return { token };
  } catch {
    return {
      error: new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      ),
    };
  }
}

function validateChatRequest(body: unknown): {
  isValid: boolean;
  data?: { model: string; messages: any[] };
  error?: { message: string; status: number };
} {
  if (!body || typeof body !== 'object') {
    return {
      isValid: false,
      error: { message: 'Invalid request body', status: 400 },
    };
  }

  const { model, messages } = body as Record<string, unknown>;

  if (!model || typeof model !== 'string') {
    return {
      isValid: false,
      error: { message: 'Model parameter is required', status: 400 },
    };
  }

  if (!messages || !Array.isArray(messages)) {
    return {
      isValid: false,
      error: {
        message: 'Messages parameter is required and must be an array',
        status: 400,
      },
    };
  }

  return {
    isValid: true,
    data: { model, messages },
  };
}

export async function POST(req: Request) {
  try {
    const useX402Header = req.headers.get('use-x402');
    const hasPaymentHeader = !!req.headers.get('x-payment');
    const useX402 = useX402Header === 'true' || hasPaymentHeader;
    const body = await req.json();

    const validation = validateChatRequest(body);
    if (!validation.isValid || !validation.data) {
      return new Response(
        JSON.stringify({
          error: 'Bad Request',
          message: validation.error!.message,
        }),
        {
          status: validation.error!.status,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const { model, messages } = validation.data;

    if (useX402) {
      const authResult = await validateAuthentication(true);
      if (authResult.error) {
        return authResult.error;
      }

      // For x402, payment is handled client-side via useChatWithPayment.
      // Use the router without server-side payment handling so 402 bubbles to client.
      const x402OpenAI = createX402OpenAIWithoutPayment({
        // If not provided, defaults to https://echo.router.merit.systems
        baseRouterUrl: process.env.X402_ROUTER_URL,
        echoAppId: process.env.ECHO_APP_ID,
      });

      const result = streamText({
        model: x402OpenAI(model),
        messages: convertToModelMessages(messages),
      });

      return result.toUIMessageStreamResponse({
        sendSources: true,
        sendReasoning: true,
        onError: UiStreamOnError(),
      });
    }

    const authResult = await validateAuthentication(false);
    if (authResult.error) {
      return authResult.error;
    }

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
