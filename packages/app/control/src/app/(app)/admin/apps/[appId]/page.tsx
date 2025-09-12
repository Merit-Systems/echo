import { AppTransactionDetails } from '@/app/(app)/admin/_components';
import { userOrRedirect } from '@/auth/user-or-redirect';

export default async function AdminAppTransactionsPage(
  props: PageProps<'/admin/apps/[appId]'>
) {
  const { appId } = await props.params;
  await userOrRedirect(`/admin/apps/${appId}`, props);

  return (
    <div className="container mx-auto py-8">
      <AppTransactionDetails appId={appId} />
    </div>
  );
}
