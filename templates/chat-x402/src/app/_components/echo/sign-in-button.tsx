'use client';

import { useEcho } from '@merit-systems/echo-next-sdk/client';
import { Button } from '@/components/ui/button';

export default function SignInButton() {
  const { signIn } = useEcho();

  return (
    <Button
      onClick={() => signIn()}
      className="group relative flex w-full justify-center rounded-lg border border-transparent bg-primary px-4 py-3 font-medium text-sm text-white transition-colors duration-200 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
    >
      Sign in with Echo
    </Button>
  );
}
