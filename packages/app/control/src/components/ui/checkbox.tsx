'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type CheckboxProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'checked'
> & {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, disabled, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type="checkbox"
        className={cn(
          'h-4 w-4 shrink-0 rounded-sm border border-input shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 accent-primary',
          className
        )}
        checked={!!checked}
        onChange={e => onCheckedChange?.(e.target.checked)}
        disabled={disabled}
        {...props}
      />
    );
  }
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };
