import { formatCurrency } from '@/lib/utils';
import { TransactionEventData } from '@/services/feed/types';

interface Props {
  numUsers: number;
  activity: TransactionEventData;
}

export const TransactionContent: React.FC<Props> = ({ numUsers, activity }) => {
  return (
    <p>
      {numUsers} user{numUsers > 1 ? 's' : ''} made{' '}
      {activity.total_transactions} request
      {activity.total_transactions > 1 ? 's' : ''} for a profit of{' '}
      <span className="font-bold text-primary">
        {formatCurrency(activity.total_profit)}
      </span>{' '}
    </p>
  );
};
