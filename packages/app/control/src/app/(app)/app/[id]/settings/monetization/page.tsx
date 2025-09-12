import { Suspense } from 'react';

import {
  GithubLinkForm,
  LoadingGithubLinkForm,
} from './_components/github-link';
import { LoadingMarkupForm, MarkupForm } from './_components/markup';

export default async function MonetizationAppSettingsPage({
  params,
}: PageProps<'/app/[id]/settings/monetization'>) {
  const { id } = await params;

  return (
    <>
      <Suspense fallback={<LoadingMarkupForm />}>
        <MarkupForm appId={id} />
      </Suspense>
      <Suspense fallback={<LoadingGithubLinkForm />}>
        <GithubLinkForm appId={id} />
      </Suspense>
    </>
  );
}
