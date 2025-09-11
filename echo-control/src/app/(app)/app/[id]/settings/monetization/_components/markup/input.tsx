'use client';

import { useFormContext } from 'react-hook-form';

import { FormField, FormItem, FormMessage } from '@/components/ui/form';

import { MarkupInput as MarkupInputComponent } from '@/app/(app)/_components/markup/input';

export const MarkupInput = () => {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name="markup"
      render={({ field }) => (
        <FormItem>
          <MarkupInputComponent
            markup={field.value as number}
            onMarkupChange={value => {
              field.onChange(value);
            }}
          />
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
