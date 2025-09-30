'use client';

/**
 * SignIn Component
 *
 * This component demonstrates Echo SDK authentication integration:
 * - Uses useEcho hook for client-side authentication
 * - Triggers OAuth flow when user clicks sign in
 * - Automatically redirects to main app after successful authentication
 *
 * The Echo SDK handles:
 * - OAuth provider configuration
 * - Token management and refresh
 * - Session persistence across browser refreshes
 */

import { useEcho } from '@merit-systems/echo-next-sdk/client';

export default function SignIn() {
  // Access Echo SDK authentication methods
  const { signIn } = useEcho();

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <button
        onClick={() => signIn()}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
      >
        Sign in
      </button>
    </div>
  );
}
