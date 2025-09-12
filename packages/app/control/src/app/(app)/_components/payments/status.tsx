import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface Props {
  status: string;
}

export const PaymentStatus: React.FC<Props> = ({ status }) => {
  const statusClassNames: Record<string, string> = {
    completed: 'text-green-600 border-green-600 bg-green-600/10',
    pending: 'text-yellow-600 border-yellow-600 bg-yellow-600/10',
    failed: 'text-red-600 border-red-600 bg-red-600/10',
  };

  return (
    <div
      className={cn(
        'border px-2 py-1 rounded-md text-xs font-semibold capitalize w-fit',
        statusClassNames[status.toLowerCase()]
      )}
    >
      {status}
    </div>
  );
};

export const LoadingPaymentStatus = () => {
  return (
    <div className="border px-2 py-1 rounded-md text-xs font-semibold capitalize w-fit">
      <Skeleton className="h-4 w-16" />
    </div>
  );
};
