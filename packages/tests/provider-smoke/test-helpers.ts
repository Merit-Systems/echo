import type { OpenAIProvider } from '@merit-systems/echo-typescript-sdk';

export const ECHO_TOKEN = process.env.ECHO_API_KEY;
export const ECHO_APP_ID = process.env.ECHO_APP_ID;
export const baseRouterUrl =
  process.env.ECHO_DATA_SERVER_URL || 'https://echo.router.merit.systems';

export const getToken = async () => ECHO_TOKEN!;

export function assertEnv() {
  if (!ECHO_TOKEN) throw new Error('Missing Echo token ECHO_API_KEY');
  if (!ECHO_APP_ID) throw new Error('Missing Echo app id (ECHO_APP_ID)');
}

export function getApiErrorDetails(err: unknown): string {
  const e = err as Record<string, unknown>;
  const status = e?.statusCode;
  const url = e?.url;
  const body = e?.responseBody;
  if (status || url || body) {
    return `status=${status ?? 'unknown'} url=${url ?? 'unknown'} body=${body ?? 'n/a'}`;
  }
  return String(e?.message ?? e);
}

export function getOpenAITools(
  openai: OpenAIProvider,
  modelId: string
): Record<string, unknown> | undefined {
  return modelId.includes('deep-research')
    ? {
        webSearchPreview: openai.tools.webSearch({
          searchContextSize: 'medium',
        }),
      }
    : undefined;
}
