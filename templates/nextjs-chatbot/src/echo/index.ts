import Echo from '@merit-systems/echo-next-sdk';

export const { handlers, isSignedIn, openai, anthropic } = Echo({
  appId: 'ba00fba2-b6c9-4753-a47d-02838633538e', // Replace with your actual Echo app ID from https://echo.merit.systems/new
});
