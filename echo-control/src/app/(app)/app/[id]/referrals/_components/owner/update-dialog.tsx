'use client';

import { useState } from 'react';

import { Check, Loader2, Pencil } from 'lucide-react';

import type z from 'zod';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { PercentInput } from '@/components/ui/percent-input';

import { setAppReferralRewardSchema } from '@/services/apps/referral-reward';

import { api } from '@/trpc/client';

interface Props {
  appId: string;
}

export const UpdateReferralBonusDialog: React.FC<Props> = ({ appId }) => {
  const [isOpen, setIsOpen] = useState(false);

  const [referralReward] =
    api.apps.app.referralReward.get.useSuspenseQuery(appId);

  const utils = api.useUtils();

  const form = useForm<z.infer<typeof setAppReferralRewardSchema>>({
    resolver: zodResolver(setAppReferralRewardSchema),
    defaultValues: {
      percentage: undefined,
    },
    mode: 'onChange',
  });

  const {
    mutate: updateReferralBonus,
    isPending,
    isSuccess,
  } = api.apps.app.referralReward.set.useMutation({
    onSuccess: () => {
      utils.apps.app.referralReward.get.invalidate(appId);
      setIsOpen(false);
    },
  });

  const handleSubmit = (data: z.infer<typeof setAppReferralRewardSchema>) => {
    updateReferralBonus({ appId, percentage: data.percentage });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="size-3.5" />
          {referralReward ? 'Update' : 'Set'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {referralReward ? 'Update' : 'Set'} Referral Bonus
          </DialogTitle>
          <DialogDescription>
            This is the % of revenue that will be allocated to users who refer
            new users.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-8"
          >
            <div className="flex flex-col w-full gap-4">
              <FormField
                control={form.control}
                name="percentage"
                render={({ field: { onChange } }) => (
                  <FormItem>
                    <FormControl>
                      <PercentInput
                        setAmount={onChange}
                        placeholder="20"
                        className="w-full text-right"
                        min="0.01"
                        max="100"
                        step="0.01"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={
                  isPending ||
                  !form.formState.isValid ||
                  isSuccess ||
                  !form.formState.isDirty
                }
                size="lg"
                variant="turbo"
              >
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : isSuccess ? (
                  <Check className="size-4" />
                ) : (
                  'Set Referral Bonus'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
