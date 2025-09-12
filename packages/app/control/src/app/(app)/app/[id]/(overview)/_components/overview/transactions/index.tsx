import { Suspense } from 'react';

import { Activity } from 'lucide-react';

import { OverviewCard } from '../lib/overview-card';
import { Table } from '../lib/table';

import { TransactionRows, LoadingTransactionRows } from './rows';

interface Props {
  appId: string;
}

export const Transactions: React.FC<Props> = ({ appId }) => {
  return (
    <TransactionsContainer appId={appId}>
      <Suspense fallback={<LoadingTransactionRows />}>
        <TransactionRows appId={appId} />
      </Suspense>
    </TransactionsContainer>
  );
};

export const LoadingTransactions = () => {
  return (
    <TransactionsContainer>
      <LoadingTransactionRows />
    </TransactionsContainer>
  );
};

const TransactionsContainer = ({
  children,
  appId,
}: {
  children: React.ReactNode;
  appId?: string;
}) => {
  return (
    <OverviewCard
      title="Transactions"
      link={appId ? `/app/${appId}/transactions` : undefined}
    >
      <Table Icon={Activity} columns={['Activity', 'Profit']}>
        {children}
      </Table>
    </OverviewCard>
  );
};
