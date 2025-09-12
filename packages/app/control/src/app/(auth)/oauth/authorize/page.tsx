import Link from 'next/link';

import { notFound } from 'next/navigation';

import { z } from 'zod';

import { Button } from '@/components/ui/button';

import { UnauthorizedRedirect } from './_components/unauthorized-redirect';

import { ErrorPage } from './_components/error-page';
import { ExistingUserAuthorize } from './_components/existing-user';
import { NewUserAuthorize } from './_components/new-user';

import { api } from '@/trpc/server';

import {
  authorizeParamsSchema,
  isValidRedirectUri,
} from '../../_lib/authorize';
import { userOrRedirect } from '@/auth/user-or-redirect';

const paramsSchema = authorizeParamsSchema.extend({
  new_user: z.literal('true').optional(),
});

export default async function OAuthAuthorizePage(
  props: PageProps<'/oauth/authorize'>
) {
  const user = await userOrRedirect('/oauth/authorize', props);

  const resolvedParams = await props.searchParams;

  const parseResult = paramsSchema.safeParse(resolvedParams);

  if (!parseResult.success) {
    return (
      <ErrorPage
        message={
          <ul className="list-disc list-inside space-y-1 text-sm">
            {parseResult.error.issues.map(err => (
              <li key={err.path.join('.')}>{err.message}</li>
            ))}
          </ul>
        }
        actions={
          typeof resolvedParams.redirect_uri === 'string' ? (
            <a href={resolvedParams.redirect_uri} className="flex-1">
              <Button variant="outline" className="w-full">
                Back to App
              </Button>
            </a>
          ) : (
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full">
                Back to Home
              </Button>
            </Link>
          )
        }
      />
    );
  }

  const authParams = parseResult.data;

  const [appDetails, owner] = await Promise.all([
    api.apps.app.get({ appId: authParams.client_id }),
    api.apps.app.getOwner(authParams.client_id),
  ]);

  if (!appDetails) {
    return notFound();
  }

  if (
    !isValidRedirectUri(
      authParams.redirect_uri,
      appDetails.authorizedCallbackUrls
    )
  ) {
    return (
      <UnauthorizedRedirect
        redirectUri={authParams.redirect_uri}
        appId={appDetails.id}
        authorizedCallbackUrls={appDetails.authorizedCallbackUrls}
      />
    );
  }

  const { name, profilePictureUrl } = appDetails;

  const scopes = authParams.scope.split(' ');

  const hasClaimed = await api.user.initialFreeTier.hasClaimed();

  if (authParams.new_user && !hasClaimed) {
    return (
      <NewUserAuthorize
        name={name}
        profilePictureUrl={profilePictureUrl}
        userImage={user.image || null}
        authParams={authParams}
      />
    );
  }

  return (
    <ExistingUserAuthorize
      name={name}
      profilePictureUrl={profilePictureUrl}
      userImage={user.image || null}
      ownerName={owner.name ?? ''}
      scopes={scopes}
      authParams={authParams}
    />
  );
}
