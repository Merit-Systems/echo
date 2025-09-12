import { Card } from '@/components/ui/card';

import { Body, Heading } from '../../../_components/layout/page-utils';

import { LoadingTransactionsTable } from './_components/transactions';

export default async function TransactionsLoadingPage() {
  return (
    <div>
      <Heading title="Transactions" />
      <Body className="gap-0">
        <Card className="overflow-hidden">
          <LoadingTransactionsTable />
        </Card>
      </Body>
    </div>
  );
}
