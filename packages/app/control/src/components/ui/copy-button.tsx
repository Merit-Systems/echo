'use client';

import { Check, Copy, Loader2 } from 'lucide-react';

import { Button, ButtonProps } from './button';
import { toast } from 'sonner';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { cn } from '@/lib/utils';

interface Props extends ButtonProps {
  text: string;
  toastMessage?: string;
  onCopy?: () => void;
  className?: string;
  isLoading?: boolean;
}

export const CopyButton: React.FC<Props> = ({
  text,
  toastMessage,
  onCopy,
  className,
  isLoading,
  ...props
}) => {
  const { isCopied, copyToClipboard } = useCopyToClipboard(() => {
    if (toastMessage) {
      toast.success(toastMessage);
    }
    onCopy?.();
  });

  return (
    <Button
      onClick={() => copyToClipboard(text)}
      variant="outline"
      className={cn('shrink-0 size-fit md:size-fit p-2', className)}
      size="icon"
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="size-3 animate-spin" />
      ) : isCopied ? (
        <Check className="size-3" />
      ) : (
        <Copy className="size-3" />
      )}
    </Button>
  );
};
