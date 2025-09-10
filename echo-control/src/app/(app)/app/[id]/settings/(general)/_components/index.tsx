import React from 'react';

import type z from 'zod';

import { notFound } from 'next/navigation';
import { revalidatePath } from 'next/cache';

import { FormCard } from '../../_components/form/card';

import { AppDetailsFormProvider } from '../../_components/app-details-form-provider';

import { AppName } from './name';
import { AppDescription } from './description';
import { AppProfilePicture } from './profile-picture';
import { AppHomepage } from './homepage';

import type { updateAppSchema } from '@/services/apps/update';

import { api } from '@/trpc/server';
import { CopyButton } from '@/components/ui/copy-button';

interface Props {
  appId: string;
}

export const GeneralAppSettings: React.FC<Props> = async ({ appId }) => {
  const app = await api.apps.app.get({ appId });

  if (!app) {
    return notFound();
  }

  const updateApp = async (values: z.infer<typeof updateAppSchema>) => {
    'use server';
    await api.apps.app
      .update({
        appId,
        ...values,
      })
      .then(() => {
        revalidatePath(`/app/${appId}`);
      });
  };
  return (
    <div className="flex flex-col gap-6">
      <FormCard
        title="App ID"
        description="Use this ID when authenticating users in your app."
        hideSaveButton
      >
        <div className="flex items-center w-full border border-primary rounded-md overflow-hidden pl-2 pr-1 py-1 bg-muted">
          <p className="flex-1 overflow-x-auto whitespace-nowrap font-mono text-sm no-scrollbar pr-2">
            {app.id}
          </p>
          <CopyButton text={app.id} toastMessage="Copied to clipboard" />
        </div>
      </FormCard>
      <AppDetailsFormProvider
        title="Name"
        fields={['name']}
        action={updateApp}
        defaultValues={{ name: app.name ?? '' }}
      >
        <FormCard
          title="Name"
          description="The public-facing name of your app. This is shown to users when they are connecting to your app."
        >
          <AppName />
        </FormCard>
      </AppDetailsFormProvider>

      <AppDetailsFormProvider
        title="Description"
        fields={['description']}
        action={updateApp}
        defaultValues={{ description: app.description ?? '' }}
        validationMode="onChange"
      >
        <FormCard
          title="Description"
          description="The description of your app. This is shown to users when they are connecting to your app."
        >
          <AppDescription />
        </FormCard>
      </AppDetailsFormProvider>

      <AppDetailsFormProvider
        fields={['profilePictureUrl']}
        title="Profile Picture"
        action={updateApp}
        defaultValues={{ profilePictureUrl: app.profilePictureUrl ?? '' }}
      >
        <FormCard
          title="Profile Picture"
          description="The profile picture of your app. This is shown to users when they are connecting to your app."
        >
          <AppProfilePicture />
        </FormCard>
      </AppDetailsFormProvider>

      <AppDetailsFormProvider
        fields={['homepageUrl']}
        title="Homepage"
        action={updateApp}
        defaultValues={{ homepageUrl: app.homepageUrl ?? '' }}
      >
        <FormCard
          title="Deployed App URL"
          description="The URL of your deployed app. This will aid in the discovery of your app."
        >
          <AppHomepage />
        </FormCard>
      </AppDetailsFormProvider>
    </div>
  );
};
