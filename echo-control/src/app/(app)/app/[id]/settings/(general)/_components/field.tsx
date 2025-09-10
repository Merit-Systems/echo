'use client';

import type { ControllerRenderProps} from 'react-hook-form';
import { useFormContext } from 'react-hook-form';

import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import type { updateAppSchema } from '@/services/apps/update';

interface Props {
  name: keyof typeof updateAppSchema.shape;
  children: (field: ControllerRenderProps) => React.ReactNode;
}

export const AppField: React.FC<Props> = ({ name, children }) => {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormControl>{children(field)}</FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
