export const isValidRedirectUri = (
  redirectUri: string,
  authorizedCallbackUrls: string[]
) => {
  const isLocalRedirect = redirectUri.startsWith('http://localhost:');
  const redirectWithoutTrailingSlash = redirectUri.replace(/\/$/, '');
  return (
    isLocalRedirect ||
    authorizedCallbackUrls.includes(redirectUri) ||
    authorizedCallbackUrls.includes(redirectWithoutTrailingSlash)
  );
};
