import Echo from '@merit-systems/echo-next-sdk';

const baseEchoUrl = process.env.NEXT_PUBLIC_ECHO_URL || 'http://localhost:3000';
const baseRouterUrl =
  process.env.NEXT_PUBLIC_ROUTER_URL || 'http://localhost:3070';
const appId =
  process.env.NEXT_PUBLIC_ECHO_APP_ID || '44ad27d4-01f5-4163-81ec-3d5ab004964d';

export const { handlers, isSignedIn, openai, anthropic, google, getUser } =
  Echo({
    appId,
    baseEchoUrl,
    baseRouterUrl,
  });
