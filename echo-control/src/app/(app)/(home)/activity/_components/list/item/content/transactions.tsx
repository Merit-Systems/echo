import { formatCurrency } from '@/lib/utils';
import type { TransactionEventData } from '@/services/feed/types';
import { DollarSign } from 'lucide-react';

interface Props {
  numUsers: number;
  activity: TransactionEventData;
}

export const TransactionContent: React.FC<Props> = ({ numUsers, activity }) => {
  return (
    <div className="flex items-center gap-1">
      <DollarSign className="size-4 text-primary" />
      <p className="truncate">
        <span className="font-bold text-primary">
          {formatCurrency(activity.total_profit, {
            style: 'decimal',
          })}
        </span>{' '}
        earned from {numUsers} user{numUsers > 1 ? 's' : ''} on{' '}
        {activity.total_transactions} request
        {activity.total_transactions > 1 ? 's' : ''}
      </p>
    </div>
  );
};
