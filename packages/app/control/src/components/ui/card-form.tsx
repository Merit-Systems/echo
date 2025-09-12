import React from 'react';

import { useFormContext } from 'react-hook-form';

import { Card } from '@/components/ui/card';
import {
  FormField as FormFieldComponent,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';

import { useFormField } from '@/components/ui/form';

import { cn } from '@/lib/utils';

import type {
  Control,
  ControllerRenderProps,
  FieldValues,
  Path,
} from 'react-hook-form';

interface Props<FormType extends FieldValues> {
  name: keyof FormType;
  render: (
    props: ControllerRenderProps<FormType, Path<FormType>>
  ) => React.ReactNode;
  label?: string;
  messageClassName?: string;
  withCard?: boolean;
  cardClassName?: string;
  description?: string;
}

const FormField = <FormType extends FieldValues>({
  name,
  label,
  render,
  messageClassName,
  withCard = false,
  cardClassName,
  description,
}: Props<FormType>) => {
  const form = useFormContext<FormType>();

  return (
    <FormFieldComponent
      control={form.control as unknown as Control<FormType>}
      name={name as Path<FormType>}
      render={({ field, fieldState }) => (
        <FormItem className="w-full">
          <FormCard withCard={withCard} cardClassName={cardClassName}>
            {label && (
              <FormLabel className="text-sm font-semibold opacity-60">
                {label}
              </FormLabel>
            )}
            <FormControl className="mt-0">{render(field)}</FormControl>
            {description && !fieldState.error && (
              <FormDescription className="text-xs opacity-60">
                {description}
              </FormDescription>
            )}
            {fieldState.error && (
              <FormMessage className={cn(messageClassName, 'text-red-700')} />
            )}
          </FormCard>
        </FormItem>
      )}
    />
  );
};

interface FormCardProps {
  children: React.ReactNode;
  withCard?: boolean;
  cardClassName?: string;
}

const FormCard = ({ children, withCard, cardClassName }: FormCardProps) => {
  const { error } = useFormField();

  if (!withCard) {
    return children;
  }

  return (
    <Card
      className={cn(
        'w-full h-fit p-2 focus-within:border-primary dark:focus-within:border-primary transition-colors duration-200 space-y-2',
        'focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px] dark:focus-within:ring-ring/50 dark:focus-within:ring-[3px]',
        error && 'border-red-600',
        cardClassName
      )}
    >
      {children}
    </Card>
  );
};

interface FormFieldWithCardProps<FormType extends FieldValues>
  extends Props<FormType> {
  cardClassName?: string;
}

export const FormFieldWithCard = <FormType extends FieldValues>({
  name,
  label,
  render,
  description,
  messageClassName,
  cardClassName,
}: FormFieldWithCardProps<FormType>) => {
  return (
    <FormField
      name={name}
      label={label}
      render={render}
      messageClassName={messageClassName}
      withCard={true}
      cardClassName={cardClassName}
      description={description}
    />
  );
};
