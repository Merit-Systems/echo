export const ECHO_COOKIE = {
  ACCESS_TOKEN: 'echo_access_token',
  REFRESH_TOKEN: 'echo_refresh_token',
  REFRESH_TOKEN_EXPIRES: 'echo_refresh_token_expires',
  USER_INFO: 'echo_user_info',
  CODE_VERIFIER: 'echo_code_verifier',
} as const;

export type EchoCookieName = (typeof ECHO_COOKIE)[keyof typeof ECHO_COOKIE];

export function namespacedCookie(name: EchoCookieName, appId: string): string {
  // Ensure consistent delimiter and avoid accidental double underscores
  return `${name}_${appId}`;
}
