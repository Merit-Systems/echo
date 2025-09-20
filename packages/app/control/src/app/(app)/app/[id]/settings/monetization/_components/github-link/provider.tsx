'use client';

import { githubLinkSchema } from '@/services/github/schema';
import {
  FormProvider,
  type FormProviderProps,
} from '../../../_components/form/context';
import { toast } from 'sonner';
import z from 'zod';

type Props = Omit<
  FormProviderProps<z.infer<typeof githubLinkSchema>>,
  'schema'
>;

export const GithubLinkFormProvider: React.FC<Props> = ({
  children,
  ...props
}) => {
  return (
    <FormProvider
      {...props}
      schema={githubLinkSchema}
      onSuccess={() => {
        toast.success(`Github link updated successfully`);
      }}
    >
      {children}
    </FormProvider>
  );
};
