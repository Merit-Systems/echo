'use client';

import { Check, Loader2 } from 'lucide-react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';

import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/trpc/client';

const descriptionSchema = z.object({
  description: z.string().min(1).max(250),
});

interface Props {
  appId: string;
  description: string | null;
}

export const Description: React.FC<Props> = ({ appId, description }) => {
  const isCompleted = description !== null;

  const form = useForm<z.infer<typeof descriptionSchema>>({
    resolver: zodResolver(descriptionSchema),
    defaultValues: {
      description: description ?? undefined,
    },
    mode: 'onChange',
  });

  const utils = api.useUtils();

  const {
    mutate: updateAppDetails,
    isPending: isUpdating,
    isSuccess,
  } = api.apps.app.update.useMutation({
    onSuccess: () => {
      toast.success('App details updated');
      void utils.apps.app.get.invalidate({ appId });
    },
    onError: () => {
      toast.error('Failed to update app details');
    },
  });

  const handleSubmit = (data: z.infer<typeof descriptionSchema>) => {
    updateAppDetails({
      appId,
      ...data,
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-4 h-full"
      >
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>App Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="A cloud-based web development agent that..."
                  {...field}
                  value={field.value ?? ''}
                  disabled={isCompleted}
                  className="resize-none h-20"
                  rows={4}
                  maxLength={250}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      void form.handleSubmit(handleSubmit)();
                    }

                    if (
                      [
                        'ArrowUp',
                        'ArrowDown',
                        'ArrowLeft',
                        'ArrowRight',
                      ].includes(e.key)
                    ) {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full mt-auto"
          disabled={
            isUpdating ||
            !form.formState.isDirty ||
            !form.formState.isValid ||
            isSuccess ||
            isCompleted
          }
        >
          {isUpdating ? (
            <Loader2 className="size-4 animate-spin" />
          ) : isSuccess ? (
            <Check className="size-4" />
          ) : isCompleted ? (
            <Check className="size-4" />
          ) : (
            'Save'
          )}
        </Button>
      </form>
    </Form>
  );
};
