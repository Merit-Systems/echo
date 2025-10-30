import TableLayout from '../_components/TableLayout';
import { EchoX402ProfitTotal } from '../_components/wallet/EchoX402ProfitTotal';
import { AppX402ProfitTotal } from '../_components/wallet/AppX402ProfitTotal';
import { X402TransactionCostTotal } from '../_components/wallet/X402TransactionCostTotal';

export default function X402PayoutsPage() {
  return (
    <TableLayout title="X402 Payouts Management">
      <>
        <p className="text-muted-foreground">
          On this page, you can claim the Echo Payouts from X402 transactions
          and manage the distribution of funds.
        </p>
      </>
      <EchoX402ProfitTotal />
      <AppX402ProfitTotal />
      <X402TransactionCostTotal />
    </TableLayout>
  );
}
