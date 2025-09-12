'use client';

import { signIn } from '@merit-systems/echo-next-sdk/client';
import { Button } from '@/components/ui/button';

export default function SignInButton() {
  return (
    <Button onClick={() => signIn()} size="lg">
      Sign in with Echo
    </Button>
  );
}
