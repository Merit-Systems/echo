import { Logo } from '@/components/ui/logo';

import { CreateAppForm } from './_components/form';

import { userOrRedirect } from '@/auth/user-or-redirect';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'New App',
};

export default async function CreateAppPage(props: PageProps<'/new'>) {
  await userOrRedirect('/new', props);

  return (
    <div className="pt-4 relative size-full flex flex-col items-center px-2">
      <div className="w-full max-w-md flex flex-col items-center justify-center gap-4 md:gap-8">
        <div className="flex flex-col items-center justify-center gap-1 md:gap-2">
          <Logo className="size-12 md:size-16" priority />
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            New App
          </h1>
        </div>
        <div className="flex flex-col items-center gap-4 w-full">
          <CreateAppForm />
          <p className="text-muted-foreground text-xs text-center">
            Your app configuration can always be changed from the settings page.
          </p>
        </div>
      </div>
    </div>
  );
}
