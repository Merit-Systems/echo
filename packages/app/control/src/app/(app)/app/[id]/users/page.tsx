import { Suspense } from 'react';

import { Body, Heading } from '../../../_components/layout/page-utils';

import { UsersTable, LoadingUsersTable } from './_components/users';

import { api, HydrateClient } from '@/trpc/server';

import { userOrRedirect } from '@/auth/user-or-redirect';

import { checkAppExists } from '../_lib/checks';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Users',
    template: 'Users | %s',
  },
};

export default async function UsersPage(props: PageProps<'/app/[id]/users'>) {
  const { id } = await props.params;

  await userOrRedirect(`/app/${id}/users` as const, props);

  await checkAppExists(id);

  api.apps.app.users.list.prefetchInfinite({ appId: id });

  return (
    <HydrateClient>
      <Heading title="Users" />
      <Body className="gap-4">
        <Suspense fallback={<LoadingUsersTable />}>
          <UsersTable appId={id} />
        </Suspense>
      </Body>
    </HydrateClient>
  );
}
