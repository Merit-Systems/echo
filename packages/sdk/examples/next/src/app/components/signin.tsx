'use client';

import { signIn } from '@merit-systems/echo-next-sdk/client';

export default function SignIn() {
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
