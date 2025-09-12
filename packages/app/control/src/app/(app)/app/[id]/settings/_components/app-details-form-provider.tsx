'use client';

import z from 'zod';

import { toast } from 'sonner';

import { FormProvider, type FormProviderProps } from './form/context';

import { updateAppSchema } from '@/services/apps/update';

interface Props
  extends Omit<FormProviderProps<z.infer<typeof updateAppSchema>>, 'schema'> {
  fields: (keyof typeof updateAppSchema.shape)[];
  title: string;
}

export const AppDetailsFormProvider = ({
  children,
  fields,
  title,
  ...props
}: Props) => {
  return (
    <FormProvider
      {...props}
      schema={updateAppSchema
        .pick(Object.fromEntries(fields.map(field => [field, true])))
        .required()}
      onSuccess={() => {
        toast.success(`${title} updated successfully`);
      }}
    >
      {children}
    </FormProvider>
  );
};
