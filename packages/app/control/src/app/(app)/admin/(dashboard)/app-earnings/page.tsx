import AppEarningsTable from '@/app/(app)/admin/_components/table/AppEarnings';
import { TableLayout } from '@/app/(app)/admin/_components';

export default function AppEarningsPage() {
  return (
    <TableLayout
      title="App Earnings"
      description="Monitor app performance and revenue generation metrics"
    >
      <AppEarningsTable />
    </TableLayout>
  );
}
