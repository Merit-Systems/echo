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
  appId: 'c0d441c4-8176-4bd6-925a-a0e8885f4e90', // staging-echo
  baseEchoUrl: 'https://staging-echo.merit.systems',
  baseRouterUrl: 'https://echo-staging.up.railway.app',
});
