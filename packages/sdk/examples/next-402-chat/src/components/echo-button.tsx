import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-md text-xs md:text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed gap-2 active:shadow-none active:translate-y-[1px]',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',
        destructive:
          'bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
        primaryOutline:
          'border border-primary text-primary bg-transparent shadow-xs hover:bg-primary/20',
        destructiveOutline:
          'border border-destructive text-destructive bg-transparent shadow-xs hover:bg-destructive/20',
        secondary:
          'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
        ghost:
          'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
        primaryGhost: 'hover:bg-primary/20 text-primary',
        link: 'text-primary underline-offset-4 hover:underline',
        success: 'bg-green-600 text-white shadow-sm hover:bg-green-700',
        turbo: cn(
          'bg-gradient-to-br from-primary via-primary/80 to-primary text-white hover:opacity-90',
          'shadow-[0_2px_6px_color-mix(in_oklab,var(--primary)_70%,transparent)]',
          'hover:shadow-[0_2px_4px_color-mix(in_oklab,var(--primary)_70%,transparent)]',
          'active:shadow-none',
          'inset-ring-2 inset-ring-inset inset-ring-border/50',
          'relative overflow-hidden',
          'before:content-[""] before:absolute before:w-full before:h-full before:rounded-md before:pointer-events-none',
          'before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:animate-shimmer'
        ),
        turboSecondary: cn(
          'bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 text-white hover:opacity-90',
          'shadow-[0_2px_6px_color-mix(in_oklab,theme(colors.gray.500)_70%,transparent)]',
          'hover:shadow-[0_2px_4px_color-mix(in_oklab,theme(colors.gray.500)_70%,transparent)]',
          'active:shadow-none',
          'inset-ring-2 inset-ring-inset inset-ring-border/50',
          'relative overflow-hidden',
          'before:content-[""] before:absolute before:w-full before:h-full before:rounded-md before:pointer-events-none',
          'before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:animate-shimmer'
        ),
        unstyled: '',
      },
      size: {
        default: 'h-8 md:h-9 px-4 py-2',
        xs: 'h-6 rounded-md px-1 text-xs md:text-xs gap-1',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'size-8 md:size-9',
        navbar: 'size-8 md:h-9 md:w-auto md:px-4 md:py-2',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
