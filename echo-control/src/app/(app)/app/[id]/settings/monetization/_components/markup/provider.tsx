'use client';

import { updateMarkupSchema } from '@/services/apps/markup';
import {
  FormProvider,
  type FormProviderProps,
} from '../../../_components/form/context';
import { toast } from 'sonner';
import type z from 'zod';

type Props = Omit<
  FormProviderProps<z.infer<typeof updateMarkupSchema>>,
  'schema'
>;

export const MarkupFormProvider: React.FC<Props> = ({ children, ...props }) => {
  return (
    <FormProvider
      {...props}
      schema={updateMarkupSchema}
      onSuccess={() => {
        toast.success(`Markup updated successfully`);
      }}
    >
      {children}
    </FormProvider>
  );
};
