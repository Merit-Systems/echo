import Echo from '@merit-systems/echo-next-sdk';

export const { handlers, isSignedIn, getUser, openai, anthropic } = Echo({
  appId: process.env.ECHO_APP_ID!,
});
