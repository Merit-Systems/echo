import dotenv from 'dotenv';
dotenv.config();

const TRUECAST_URL = 'https://true-cast-agent.vercel.app/api/trueCast';
const GLORIA_URL = 'https://api.itsgloria.ai/news';
const ECHO_ROUTER_BASE_URL =
  process.env.ECHO_ROUTER_BASE_URL || 'http://localhost:3070';
const ECHO_API_KEY = process.env.ECHO_API_KEY;

interface TrueCastRequest {
  prompt: string;
}
interface GloriaNewsParams {
  feed_categories?: string;
}
export async function postTrueCastRequest(
  prompt: string,
  apiKey?: string
): Promise<string> {
  const key = apiKey || ECHO_API_KEY;

  if (!key) {
    throw new Error('ECHO_API_KEY is required');
  }

  const trueCastBody: TrueCastRequest = { prompt };

  const response = await fetch(
    `${ECHO_ROUTER_BASE_URL}/x402?proxy=${encodeURIComponent(TRUECAST_URL)}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(trueCastBody),
    }
  );
  console.log('response', response.status);
  const data = await response.json();
  console.log('data', data);
  return data;
}

export async function getGloriaNews(
  params: GloriaNewsParams = { feed_categories: 'base' },
  apiKey?: string
): Promise<string> {
  const key = apiKey || ECHO_API_KEY;

  if (!key) {
    throw new Error('ECHO_API_KEY is required');
  }

  const queryParams = new URLSearchParams(
    params as Record<string, string>
  ).toString();
  const gloriaUrlWithParams = `${GLORIA_URL}?${queryParams}`;

  const response = await fetch(
    `${ECHO_ROUTER_BASE_URL}/x402?proxy=${encodeURIComponent(gloriaUrlWithParams)}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${key}`,
      },
    }
  );

  console.log('response', response.status);
  const data = await response.json();
  console.log('data', data);
  return data;
}
getGloriaNews({ feed_categories: 'base' }, ECHO_API_KEY);
postTrueCastRequest(
  'Was donald trump the first president of the united states?',
  ECHO_API_KEY
);
