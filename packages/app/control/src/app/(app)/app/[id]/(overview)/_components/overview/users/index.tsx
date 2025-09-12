import { Suspense } from 'react';

import { User } from 'lucide-react';

import { OverviewCard } from '../lib/overview-card';
import { Table } from '../lib/table';

import { UserRows, LoadingUserRows } from './rows';

import { api } from '@/trpc/server';

interface Props {
  appId: string;
}

export const Users: React.FC<Props> = ({ appId }) => {
  const usersPromise = api.apps.app.users.list({
    appId,
    page_size: 5,
  });

  return (
    <UsersContainer appId={appId}>
      <Suspense fallback={<LoadingUserRows />}>
        <UserRows usersPromise={usersPromise.then(users => users.items)} />
      </Suspense>
    </UsersContainer>
  );
};

export const LoadingUsers = () => {
  return (
    <UsersContainer>
      <LoadingUserRows />
    </UsersContainer>
  );
};

const UsersContainer = ({
  children,
  appId,
}: {
  children: React.ReactNode;
  appId?: string;
}) => {
  return (
    <OverviewCard
      title="Users"
      link={appId ? `/app/${appId}/users` : undefined}
    >
      <Table Icon={User} columns={['Name', 'Transactions', 'Cost', 'Profit']}>
        {children}
      </Table>
    </OverviewCard>
  );
};
