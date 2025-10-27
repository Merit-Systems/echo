import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { OpenMailButton } from './open-mail-button';

export default async function VerifyEmailPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full">
      <Logo className="size-20" />
      <div className="flex flex-col items-center justify-center gap-2 text-center">
        <h1 className="text-3xl font-bold">Verify your Email</h1>
        <p className="text-md text-muted-foreground/80 max-w-sm">
          We sent you an email with a link to verify your email address.
        </p>
      </div>
      <OpenMailButton />
      <Link href="/login">
        <Button variant="outline">Back to Login</Button>
      </Link>
    </div>
  );
}
