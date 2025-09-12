import { FormCard } from '../../../_components/form/card';

import { AppDetailsFormProvider } from '../../../_components/app-details-form-provider';

import { AuthorizedCallbackUrlsInput } from './input';

import { api } from '@/trpc/server';

const AuthorizedCallbacksFormCard = ({
  children,
  isLoading,
}: {
  children: React.ReactNode;
  isLoading: boolean;
}) => {
  return (
    <FormCard
      title="Authorized Callbacks"
      description="The URLs that are authorized to receive OAuth callbacks."
      docsUrl="/docs/advanced/callback-urls"
      isLoading={isLoading}
    >
      {children}
    </FormCard>
  );
};

export const AuthorizedCallbacksForm = async ({ appId }: { appId: string }) => {
  const { authorizedCallbackUrls } = await api.apps.app.get({ appId });

  return (
    <AppDetailsFormProvider
      fields={['authorizedCallbackUrls']}
      title="Authorized Callbacks"
      defaultValues={{
        authorizedCallbackUrls: authorizedCallbackUrls ?? [],
      }}
      action={async values => {
        'use server';
        await api.apps.app.update({
          appId,
          authorizedCallbackUrls: values.authorizedCallbackUrls,
        });
      }}
    >
      <AuthorizedCallbacksFormCard isLoading={false}>
        <AuthorizedCallbackUrlsInput />
      </AuthorizedCallbacksFormCard>
    </AppDetailsFormProvider>
  );
};
