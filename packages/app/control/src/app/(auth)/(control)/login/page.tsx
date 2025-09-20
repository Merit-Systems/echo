import { redirect } from 'next/navigation';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { Separator } from '@/components/ui/separator';

import { ProviderButton } from './provider-button';

import { auth, signIn } from '@/auth';

import { oauthProviders } from '@/auth/providers';

import { cn } from '@/lib/utils';
import { Route } from 'next';

export default async function SignInPage({
  searchParams,
}: PageProps<'/login'>) {
  const { redirect_url } = await searchParams;

  const redirectTo =
    redirect_url && typeof redirect_url === 'string' ? redirect_url : '/';

  const session = await auth();

  if (session) {
    return redirect(redirectTo as Route);
  }

  return (
    <div className="gap-6 flex flex-col items-center z-10">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="size-16 p-3 border rounded-xl flex items-center justify-center bg-background">
          <Logo className="size-full" />
        </div>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold text-foreground">Log in to Echo</h1>
          <h2 className="text-muted-foreground/80 text-sm">
            Your Global Account for LLM Access
          </h2>
        </div>
      </div>
      <form
        action={async formData => {
          'use server';

          const provider = formData.get('provider');
          if (!provider) {
            throw new Error('Provider is required');
          }

          await signIn(provider as string, {
            redirectTo: redirectTo || '/',
          });
        }}
        className="flex flex-col sm:flex-row gap-2 w-full items-center"
      >
        {oauthProviders.map(provider => {
          return <ProviderButton key={provider.id} provider={provider} />;
        })}
      </form>
      <div className="flex items-center gap-4 w-full opacity-60">
        <Separator className="flex-1" />
        <span className="text-muted-foreground text-sm">or</span>
        <Separator className="flex-1" />
      </div>
      <form
        className="flex flex-col gap-4 w-full group"
        action={async formData => {
          'use server';
          const email = formData.get('email');
          if (!email || typeof email !== 'string') {
            throw new Error('Email is required');
          }

          await signIn('resend', {
            email,
            redirectTo,
            redirect: false,
          });

          return redirect('/verify-email');
        }}
      >
        <div className="flex flex-col gap-1">
          <label
            htmlFor="email"
            className="text-sm text-muted-foreground/80 font-medium"
          >
            Email
          </label>
          <div className="bg-background rounded-xl">
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="richard@piedpiper.com"
              className="rounded-xl placeholder:text-muted-foreground/40 py-3 px-4 h-fit peer border-2 font-medium"
              required
            />
          </div>
          <p className="text-xs text-muted-foreground/60">
            We&apos;ll send you a link to sign in with your email.
          </p>
        </div>
        <div className="bg-background rounded-xl">
          <Button
            type="submit"
            className={cn(
              'border-2 border-border rounded-xl size-fit px-5 py-3 font-bold flex-1 w-full',
              'group-invalid:pointer-events-none group-invalid:opacity-40 group-invalid:cursor-not-allowed group-[invalid]:pointer-events-none group-[invalid]:opacity-40 group-[invalid]:cursor-not-allowed'
            )}
            variant="secondary"
            style={{
              transition: 'opacity 0.2s ease-in-out',
            }}
          >
            Log In
          </Button>
        </div>
      </form>
    </div>
  );
}
