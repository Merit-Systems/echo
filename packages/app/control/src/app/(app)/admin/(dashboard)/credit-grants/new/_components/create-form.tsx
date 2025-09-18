'use client';

import z from 'zod';

import { addYears } from 'date-fns';

import { toast } from 'sonner';

import { useRouter } from 'next/navigation';

import { CreditGrantForm } from '../../(overview)/_components/form';

import { api } from '@/trpc/client';

import { adminCreateCreditGrantSchema } from '@/services/admin/schemas';

export const CreateCreditGrantForm = () => {
  const utils = api.useUtils();

  const router = useRouter();

  const {
    mutate: createCreditGrant,
    isPending,
    isSuccess,
  } = api.admin.creditGrants.create.useMutation({
    onSuccess: ({ code }) => {
      utils.admin.creditGrants.list.invalidate();
      toast.success('Credit grant created');
      router.push(`/admin/credit-grants/${code}`);
    },
    onError: error => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: z.infer<typeof adminCreateCreditGrantSchema>) => {
    createCreditGrant(data);
  };

  return (
    <CreditGrantForm
      title="Create Credit Grant"
      description="Create a new credit grant"
      submitButtonText="Create"
      onSubmit={onSubmit}
      isSubmitting={isPending}
      isSuccess={isSuccess}
      defaultValues={{
        expiresAt: addYears(new Date(), 1),
        maxUsesPerUser: 1,
      }}
    />
  );
};
