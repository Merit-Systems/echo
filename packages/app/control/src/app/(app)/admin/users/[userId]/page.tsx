import { UserTransactionDetails } from '@/app/(app)/admin/_components';
import { userOrRedirect } from '@/auth/user-or-redirect';

export default async function AdminUserTransactionsPage(
  props: PageProps<'/admin/users/[userId]'>
) {
  const { userId } = await props.params;
  await userOrRedirect(`/admin/users/${userId}`, props);

  return (
    <div className="container mx-auto py-8">
      <UserTransactionDetails userId={userId} />
    </div>
  );
}
