'use client';

import { signOut } from '@merit-systems/echo-next-sdk/client';

export default function SignOut() {
  return (
    <div className="flex flex-col items-center justify-center">
      <button
        onClick={() => signOut()}
        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
      >
        Sign out
      </button>
    </div>
  );
}
