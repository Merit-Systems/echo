import { api } from '@/trpc/server';
import { FormCard } from '../../../_components/form/card';
import { GithubLinkInput, LoadingGithubLinkInput } from './input';
import { GithubLinkFormProvider } from './provider';

const GithubLinkFormCard = ({
  children,
  isLoading,
}: {
  children: React.ReactNode;
  isLoading: boolean;
}) => {
  return (
    <FormCard
      title="Github Link"
      description="The Github link for your app. This is used to display the Github link on the app page."
      docsUrl="/docs/monetization"
      isLoading={isLoading}
    >
      {children}
    </FormCard>
  );
};

export const GithubLinkForm = async ({ appId }: { appId: string }) => {
  const githubLink = await api.apps.app.githubLink.get(appId);

  return (
    <GithubLinkFormProvider
      defaultValues={{
        type: githubLink?.githubType ?? 'repo',
        url: githubLink?.githubUrl ?? '',
      }}
      action={async values => {
        'use server';
        await api.apps.app.githubLink.update({
          appId,
          type: values.type,
          url: values.url,
        });
      }}
    >
      <GithubLinkFormCard isLoading={false}>
        <GithubLinkInput />
      </GithubLinkFormCard>
    </GithubLinkFormProvider>
  );
};

export const LoadingGithubLinkForm = () => {
  return (
    <GithubLinkFormCard isLoading={true}>
      <LoadingGithubLinkInput />
    </GithubLinkFormCard>
  );
};
