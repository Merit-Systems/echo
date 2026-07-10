import { formatCurrency } from '@/lib/currency-utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { type EchoContextValue } from '@merit-systems/echo-react-sdk';
import { Gift } from 'lucide-react';

export default function EchoBalance({ echo }: { echo: EchoContextValue }) {
  const { balance, freeTierBalance } = echo;

  const freeTierAmountLeft = freeTierBalance?.userSpendInfo.amountLeft ?? 0;
  const totalBalance = (balance?.balance || 0) + (freeTierAmountLeft || 0);
  const hasFreeCredits = freeTierAmountLeft > 0;

  return (
    <div className="p-4">
      <div className="space-y-1 flex flex-col items-center">
        <div className="flex flex-col items-center gap-1">
          <div className="text-2xl font-semibold">
            {formatCurrency(totalBalance)}
          </div>
          {hasFreeCredits && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span>{formatCurrency(balance?.balance || 0)}</span>
              <span>+</span>
              <span className="flex items-center gap-1">
                {formatCurrency(freeTierAmountLeft)}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary cursor-help">
                        <Gift className="size-3 text-primary-foreground" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Free credits you can spend only on this app</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </span>
            </div>
          )}
        </div>
        <p className="text-sm text-foreground">Available Credits</p>
      </div>
    </div>
  );
}
