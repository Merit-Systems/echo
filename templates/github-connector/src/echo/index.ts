import Echo from "@merit-systems/echo-next-sdk";

export const { handlers, isSignedIn, getUser, openai, anthropic } = Echo({
  appId: "51cf5df5-4201-41cf-80ed-0ef3b7ab586f",
});
