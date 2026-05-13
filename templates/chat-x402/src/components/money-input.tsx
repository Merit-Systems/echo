import React, { useEffect, useRef } from 'react';

import AutoNumeric from 'autonumeric';

import { Input } from '@/components/ui/input';

import { cn } from '@/lib/utils';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  setAmount: (amount: number) => void;
  initialAmount?: number;
  placeholder?: string;
  prefixClassName?: string;
  className?: string;
  inputClassName?: string;
  hideDollarSign?: boolean;
  decimalPlaces?: number;
}

export const MoneyInput: React.FC<Props> = ({
  setAmount,
  initialAmount,
  placeholder,
  className,
  inputClassName,
  prefixClassName,
  hideDollarSign,
  decimalPlaces = 2,
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autoNumericRef = useRef<AutoNumeric | null>(null);

  useEffect(() => {
    if (inputRef.current) {
      const minimumValue = '0.000001';
      const maximumValue = '99999999999999.99';

      autoNumericRef.current = new AutoNumeric(inputRef.current, {
        digitGroupSeparator: ',',
        decimalCharacter: '.',
        decimalPlaces,
        currencySymbol: '',
        minimumValue,
        maximumValue,
        modifyValueOnWheel: false,
        formatOnPageLoad: true,
        unformatOnSubmit: true,
        watchExternalChanges: true,
        emptyInputBehavior: 'focus',
        overrideMinMaxLimits: 'invalid',
        allowDecimalPadding: false,
      });

      // Add event listener for value changes
      inputRef.current.addEventListener('autoNumeric:formatted', () => {
        const value = autoNumericRef.current?.getNumber() ?? 0;
        setAmount(value);
      });
    }

    return () => {
      if (autoNumericRef.current) {
        autoNumericRef.current.remove();
      }
    };
  }, [setAmount, decimalPlaces]);

  return (
    <div
      className={cn(
        'border-border bg-card flex h-fit flex-row items-center overflow-hidden rounded-md border-2 pr-1 transition-colors duration-200',
        'focus-within:border-ring/80 focus-within:ring-ring/50 focus-within:ring-[3px]',
        className
      )}
    >
      <div
        className={cn(
          'bg-foreground/10 flex aspect-square size-12 h-full items-center justify-center text-lg opacity-60',
          prefixClassName,
          hideDollarSign && 'hidden'
        )}
      >
        $
      </div>
      <Input
        {...props}
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        className={cn(
          'h-fit w-full [appearance:textfield] border-none bg-transparent px-3 py-0 font-bold shadow-none dark:bg-transparent [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
          'text-xl ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 md:text-xl',
          inputClassName
        )}
        defaultValue={initialAmount?.toString()}
      />
    </div>
  );
};
