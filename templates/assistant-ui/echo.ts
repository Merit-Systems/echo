import Echo from '@merit-systems/echo-next-sdk';

const echo = Echo({
  appId: process.env.NEXT_PUBLIC_ECHO_APP_ID ?? 'ECHO_APP_ID',
});

export const { getUser, isSignedIn, openai, anthropic, google } = echo;

export default echo.handlers;
