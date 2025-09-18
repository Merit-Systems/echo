import { Body, Heading } from '@/app/(app)/_components/layout/page-utils';
import { CreateCreditGrantForm } from './_components/create-form';

export default function NewCreditGrantPage() {
  return (
    <div>
      <Heading
        title="New Credit Grant"
        description="Create a new credit grant to give users free credits"
      />
      <Body>
        <CreateCreditGrantForm />
      </Body>
    </div>
  );
}
