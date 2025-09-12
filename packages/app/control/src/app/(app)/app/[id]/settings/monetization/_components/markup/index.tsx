import { api } from '@/trpc/server';
import { FormCard } from '../../../_components/form/card';
import { MarkupInput } from './input';
import { MarkupFormProvider } from './provider';
import { LoadingMarkupInput } from '@/app/(app)/_components/markup/input';

interface Props {
  appId: string;
}

export const MarkupForm: React.FC<Props> = async ({ appId }) => {
  const markup = await api.apps.app.markup.get(appId);

  return (
    <MarkupFormProvider
      defaultValues={{
        markup: Math.max(1, Math.min(Number(markup?.amount) ?? 2, 10)),
      }}
      action={async values => {
        'use server';
        const clamped = Math.max(1, Math.min(values.markup, 10));
        await api.apps.app.markup.update({
          appId,
          markup: clamped,
        });
      }}
    >
      <MarkupFormCard isLoading={false}>
        <MarkupInput />
      </MarkupFormCard>
    </MarkupFormProvider>
  );
};

export const LoadingMarkupForm = () => {
  return (
    <MarkupFormCard isLoading={true}>
      <LoadingMarkupInput />
    </MarkupFormCard>
  );
};

const MarkupFormCard = ({
  children,
  isLoading,
}: {
  children: React.ReactNode;
  isLoading: boolean;
}) => {
  return (
    <FormCard
      title="Markup"
      description="How much you want to upcharge for each input and output token processed on your app."
      docsUrl="/docs/monetization"
      isLoading={isLoading}
    >
      {children}
    </FormCard>
  );
};
