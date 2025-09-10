import { formatCurrency } from '@/lib/utils';
import type { TransactionEventData } from '@/services/feed/types';

interface Props {
  numUsers: number;
  activity: TransactionEventData;
}

export const TransactionContent: React.FC<Props> = ({ numUsers, activity }) => {
  return (
    <p className="truncate">
      <span className="font-bold text-primary">
        {formatCurrency(activity.total_profit)}
      </span>{' '}
      earned from {numUsers} user{numUsers > 1 ? 's' : ''} on{' '}
      {activity.total_transactions} request
      {activity.total_transactions > 1 ? 's' : ''}
    </p>
  );
};
