'use client';

import { updateGithubLinkSchema } from '@/services/apps/github-link';
import {
  FormProvider,
  type FormProviderProps,
} from '../../../_components/form/context';
import { toast } from 'sonner';
import type z from 'zod';

type Props = Omit<
  FormProviderProps<z.infer<typeof updateGithubLinkSchema>>,
  'schema'
>;

export const GithubLinkFormProvider: React.FC<Props> = ({
  children,
  ...props
}) => {
  return (
    <FormProvider
      {...props}
      schema={updateGithubLinkSchema}
      onSuccess={() => {
        toast.success(`Github link updated successfully`);
      }}
    >
      {children}
    </FormProvider>
  );
};
