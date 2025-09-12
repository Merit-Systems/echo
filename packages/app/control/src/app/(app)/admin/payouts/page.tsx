import {
  PendingPayoutsTable,
  CompletedPayoutsTable,
} from '@/app/(app)/admin/_components';
import { userOrRedirect } from '@/auth/user-or-redirect';

export default async function AdminPayoutsPage(
  props: PageProps<'/admin/payouts'>
) {
  await userOrRedirect('/admin/payouts', props);

  return (
    <div className="container mx-auto py-8 space-y-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Admin Payouts</h1>
        <p className="text-muted-foreground mt-2">
          Review pending payouts and view completed payout history.
        </p>
      </div>

      <PendingPayoutsTable pageSize={10} />

      <div className="pt-4 border-t">
        <CompletedPayoutsTable pageSize={10} />
      </div>
    </div>
  );
}
