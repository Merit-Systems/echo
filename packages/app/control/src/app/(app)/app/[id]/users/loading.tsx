import { Card } from '@/components/ui/card';

import { Body, Heading } from '../../../_components/layout/page-utils';

import { LoadingUsersTable } from './_components/users';

export default async function UsersLoadingPage() {
  return (
    <div>
      <Heading title="Users" />
      <Body className="gap-0">
        <Card className="overflow-hidden">
          <LoadingUsersTable />
        </Card>
      </Body>
    </div>
  );
}
