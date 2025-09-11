'use client';

import type z from 'zod';

import type {
  DefaultValues,
  Resolver,
  UseFormProps} from 'react-hook-form';
import {
  useForm
} from 'react-hook-form';

import { Form } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';

export interface FormProviderProps<T> {
  children: React.ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: z.ZodType<T, any, any>;
  defaultValues: UseFormProps['defaultValues'];
  action: (values: T) => Promise<void>;
  onSuccess?: () => void;
  onError?: () => void;
  validationMode?: 'onBlur' | 'onChange' | 'onSubmit' | 'all' | 'onTouched';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const FormProvider = <T, Schema extends z.ZodType<T, any, any>>({
  children,
  schema,
  defaultValues,
  action,
  onSuccess,
  onError,
  validationMode,
}: FormProviderProps<T>) => {
  const form = useForm({
    resolver: zodResolver(schema) as Resolver<
      z.core.output<Schema>,
      unknown,
      z.core.output<Schema>
    >,
    defaultValues: defaultValues as DefaultValues<z.core.output<Schema>>,
    mode: validationMode,
  });

  const onSubmit = form.handleSubmit(async values => {
    try {
      await action(values);
      form.reset(values);
      onSuccess?.();
    } catch {
      onError?.();
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit}>{children}</form>
    </Form>
  );
};
