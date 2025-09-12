import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';

import { cn } from '@/lib/utils';

const sliderVariants = {
  default: 'bg-primary',
  secondary: 'bg-secondary',
};

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
    variant?: keyof typeof sliderVariants;
    rangeClassName?: string;
    rangeStyle?: React.CSSProperties;
    orientation?: 'horizontal' | 'vertical';
    reverse?: boolean;
    hideRange?: boolean;
  }
>(
  (
    {
      className,
      variant = 'default',
      rangeClassName,
      rangeStyle,
      orientation = 'horizontal',
      reverse = false,
      value,
      onValueChange,
      min = 0,
      max = 100,
      hideRange = false,
      ...props
    },
    ref
  ) => {
    // Invert value for vertical reverse
    const isVerticalReverse = orientation === 'vertical' && reverse;
    const mappedValue =
      isVerticalReverse && value
        ? value.map(v => (max as number) - (v as number) + (min as number))
        : value;
    const handleValueChange = (val: number[]) => {
      if (isVerticalReverse) {
        const reversed = val.map(
          v => (max as number) - (v as number) + (min as number)
        );
        onValueChange?.(reversed);
      } else {
        onValueChange?.(val);
      }
    };
    return (
      <SliderPrimitive.Root
        ref={ref}
        className={cn(
          'relative flex touch-none select-none items-center',
          orientation === 'vertical' ? 'flex-col h-full w-2' : 'w-full h-2',
          className
        )}
        orientation={orientation}
        min={min}
        max={max}
        value={mappedValue}
        onValueChange={handleValueChange}
        {...props}
      >
        <SliderPrimitive.Track
          className={cn(
            'relative overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700',
            orientation === 'vertical' ? 'h-full w-2' : 'h-2 w-full',
            isVerticalReverse && 'flex flex-col-reverse'
          )}
        >
          <SliderPrimitive.Range
            className={cn(
              'absolute',
              orientation === 'vertical' ? 'w-full' : 'h-full',
              sliderVariants[variant],
              rangeClassName,
              isVerticalReverse && 'scale-y-[-1]',
              hideRange && 'hidden'
            )}
            style={rangeStyle}
          />
        </SliderPrimitive.Track>
        {!props.disabled && (
          <SliderPrimitive.Thumb
            className={cn(
              'block h-4 w-4 rounded-full border-2 border-background bg-primary ring-offset-background transition-colors focus-visible:outline-hidden focus-visible:ring-0 focus-visible:ring-primary focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50',
              variant === 'secondary' &&
                'bg-secondary focus-visible:ring-secondary',
              isVerticalReverse && 'scale-y-[-1]'
            )}
          />
        )}
      </SliderPrimitive.Root>
    );
  }
);
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
