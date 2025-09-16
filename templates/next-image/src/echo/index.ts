import Echo from '@merit-systems/echo-next-sdk';

const appId = process.env.ECHO_APP_ID!;

export const {
  handlers,
  isSignedIn,
  openai,
  anthropic,
  google,
  getUser,
  getEchoToken,
} = Echo({
  appId,
});
