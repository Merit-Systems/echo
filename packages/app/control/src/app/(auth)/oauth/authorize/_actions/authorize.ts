'use server';

import {
  AuthorizeParams,
  getAuthorizationRedirect,
} from '@/app/(auth)/_lib/authorize';
import { api } from '@/trpc/server';
import { Route } from 'next';
import { redirect } from 'next/navigation';

export const authorize = async (params: AuthorizeParams) => {
  if (params.referral_code) {
    const referralCode = await api.apps.app.referralCode.get.byCode(
      params.referral_code
    );
    if (referralCode) {
      const membership = await api.apps.app.memberships.get({
        appId: params.client_id,
      });
      if (membership) {
        if (membership.referrerId === null) {
          await api.apps.app.memberships.update.referrer({
            appId: params.client_id,
            referrerId: referralCode.id,
          });
        }
      } else {
        await api.apps.app.memberships.create({
          appId: params.client_id,
          referrerId: referralCode.id,
        });
      }
    }
  }

  const redirect_url = await getAuthorizationRedirect(params);

  if (!redirect_url) {
    return { error: 'unauthorized', error_description: 'Invalid redirect URL' };
  }

  return redirect(redirect_url as Route);
};
