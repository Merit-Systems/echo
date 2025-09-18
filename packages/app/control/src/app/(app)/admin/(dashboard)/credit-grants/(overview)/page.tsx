import { Suspense } from 'react';

import { userOrRedirect } from '@/auth/user-or-redirect';
import { api, HydrateClient } from '@/trpc/server';
import { Body, Heading } from '../../../../_components/layout/page-utils';
import {
  CreditGrantsTable,
  LoadingCreditGrantTable,
} from './_components/table';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default async function AdminCodesPage(
  props: PageProps<'/admin/credit-grants'>
) {
  await userOrRedirect('/admin/credit-grants', props);

  api.admin.creditGrants.list.prefetchInfinite({});

  return (
    <HydrateClient>
      <Heading
        title="Credit Grants"
        description="Manage and mint credit grants for users to get free credits"
        actions={
          <Link href="/admin/credit-grants/new">
            <Button variant="turbo">
              <Plus className="size-4" />
              New Credit Grant
            </Button>
          </Link>
        }
      />
      <Body>
        <Suspense fallback={<LoadingCreditGrantTable />}>
          <CreditGrantsTable />
        </Suspense>
      </Body>
    </HydrateClient>
  );
}
