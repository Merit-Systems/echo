'use client';

import { Check, Loader2 } from 'lucide-react';

import type { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';

import { toast } from 'sonner';

import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormFieldWithCard } from '@/components/ui/card-form';
import { Separator } from '@/components/ui/separator';

import { createAppSchema } from '@/services/apps/create';

import { api } from '@/trpc/client';
import { MarkupInput } from '../../../_components/markup/input';

export const CreateAppForm = () => {
  const form = useForm<z.infer<typeof createAppSchema>>({
    resolver: zodResolver(createAppSchema),
    defaultValues: {
      name: '',
      markup: 4,
    },
    mode: 'onChange',
  });

  const router = useRouter();

  const {
    mutate: createApp,
    isPending,
    isSuccess,
  } = api.apps.create.useMutation({
    onSuccess: ({ id }) => {
      router.push(`/app/${id}`);
    },
    onError: error => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: z.infer<typeof createAppSchema>) => {
    createApp(data);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-2 md:space-y-4 w-full"
      >
        <FormFieldWithCard
          name="name"
          label="Name"
          render={field => (
            <Input
              {...field}
              placeholder="Enter a Name"
              className="bg-transparent dark:bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none p-0 h-fit font-bold"
            />
          )}
          description="This name will be shown to users when they connect their Echo account"
        />
        <FormFieldWithCard
          name="markup"
          label="Markup"
          description="You will earn this markup as revenue for every LLM credit spent on your app."
          render={field => (
            <MarkupInput
              markup={field.value}
              onMarkupChange={value => {
                field.onChange(value);
              }}
            />
          )}
        />
        <Separator />
        <Button
          type="submit"
          className="w-full"
          disabled={!form.formState.isValid || isPending || isSuccess}
          variant="turbo"
          size="lg"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isSuccess ? (
            <Check className="w-4 h-4" />
          ) : null}
          {isPending
            ? 'Creating...'
            : isSuccess
              ? 'Navigating to app...'
              : 'Create App'}
        </Button>
      </form>
    </Form>
  );
};
