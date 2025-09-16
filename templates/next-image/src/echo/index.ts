import Echo from '@merit-systems/echo-next-sdk';

const appId =
  process.env.NEXT_PUBLIC_ECHO_APP_ID || '74d9c979-e036-4e43-904f-32d214b361fc';

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
