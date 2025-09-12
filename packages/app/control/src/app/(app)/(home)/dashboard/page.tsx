import { Body, Heading } from '../../_components/layout/page-utils';

import { GlobalSection } from './_components/global';
import { PersonalSection } from './_components/personal';

import { Separator } from '@/components/ui/separator';
import { userOrRedirect } from '@/auth/user-or-redirect';

export default async function DashboardPage(props: PageProps<'/dashboard'>) {
  const user = await userOrRedirect('/dashboard', props);

  const searchParams = await props.searchParams;
  const newUser = searchParams.new_user === 'true';

  return (
    <div>
      <Heading
        title={`Welcome${!newUser ? ' Back' : ''}${user.name ? `, ${user.name.split(' ')[0]}!` : '!'}`}
        description="Build AI apps and earn profit on every token your users generate"
      />
      <Body>
        <PersonalSection />
      </Body>
      <Separator />
      <Body>
        <GlobalSection />
      </Body>
    </div>
  );
}
