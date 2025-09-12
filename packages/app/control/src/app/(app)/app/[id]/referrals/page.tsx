import { PublicReferralsPage } from './_components/public';
import { OwnerReferralsPage } from './_components/owner';

import { getIsOwner } from '../_lib/fetch';
import { checkAppExists } from '../_lib/checks';

import { userOrRedirect } from '@/auth/user-or-redirect';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Referrals',
};

export default async function AppReferralsPage(
  props: PageProps<'/app/[id]/referrals'>
) {
  const { id } = await props.params;

  const user = await userOrRedirect(`/app/${id}/referrals`, props);

  await checkAppExists(id);

  const isOwner = await getIsOwner(id);

  if (isOwner) {
    return <OwnerReferralsPage appId={id} />;
  }

  return <PublicReferralsPage appId={id} userId={user.id} />;
}
