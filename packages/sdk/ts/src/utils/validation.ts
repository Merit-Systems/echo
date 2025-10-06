/**
 * UUID v4 regex pattern
 */
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Validates that an Echo App ID is a valid UUID v4
 * @param appId - The app ID to validate
 * @param context - Optional context for the error message (e.g., 'createEchoOpenAI')
 * @throws Error if the app ID is invalid
 */
export function validateAppId(appId: string, context?: string): void {
  if (!appId || typeof appId !== 'string') {
    throw new Error(
      `Invalid Echo App ID${context ? ` in ${context}` : ''}: App ID must be a non-empty string. Received: ${typeof appId === 'string' ? `"${appId}"` : typeof appId}`
    );
  }

  if (!UUID_REGEX.test(appId)) {
    throw new Error(
      `Invalid Echo App ID${context ? ` in ${context}` : ''}: App ID must be a valid UUID v4 format. Received: "${appId}". Expected format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx (e.g., "60601628-cdb7-481e-8f7e-921981220348")`
    );
  }
}
