import { convertToModelMessages, streamText, type UIMessage } from 'ai';
import { createEchoOpenAI } from '@merit-systems/echo-typescript-sdk';
import { db } from '@/lib/db';
import { getUser } from '@/echo';

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

    const user = await getUser();

    if (!user) {
      throw new Error('User not found');
    }

    const apiKey = await db.user.findUnique({
      where: {
        email: user.email,
      },
      select: {
        apiKey: true,
      },
    });

    if (!apiKey) {
      throw new Error('API key not found');
    }

    const openai = createEchoOpenAI(
      {
        appId: process.env.ECHO_APP_ID!,
      },
      async appId => {
        console.log('appId', appId);
        return apiKey.apiKey;
      },
      () => {
        return new Response(
          JSON.stringify({
            error: 'Insufficient funds',
            message: 'Insufficient funds',
          })
        );
      }
    );

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
