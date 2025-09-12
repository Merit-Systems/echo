import { Section } from '../utils';

import { Apps, LoadingAppsSection } from './apps';
import { Feed, LoadingFeed } from './feed';
import { Earnings, LoadingEarnings } from './earnings';

import { api } from '@/trpc/server';
import { cn } from '@/lib/utils';

export const PersonalSection = () => {
  const userApps = api.apps.list.owner({
    page_size: 3,
  });
  const numAppsPromise = userApps.then(apps => apps.total_count);

  const feedPromise = api.user.feed.list({
    cursor: new Date(),
    limit: 5,
    numHours: 4,
  });

  return (
    <PersonalSectionContainer>
      <ItemsColumnContainer>
        <Apps userApps={userApps} />
        <Feed numAppsPromise={numAppsPromise} feedPromise={feedPromise} />
      </ItemsColumnContainer>
      <ChartColumnContainer>
        <Earnings numAppsPromise={numAppsPromise} />
      </ChartColumnContainer>
    </PersonalSectionContainer>
  );
};

export const LoadingPersonalSection = () => {
  return (
    <PersonalSectionContainer>
      <ItemsColumnContainer>
        <LoadingAppsSection />
        <LoadingFeed />
      </ItemsColumnContainer>
      <ChartColumnContainer>
        <LoadingEarnings />
      </ChartColumnContainer>
    </PersonalSectionContainer>
  );
};

const PersonalSectionContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <Section title="Your Overview">
      <div className="flex flex-col-reverse md:grid md:grid-cols-12 gap-8 max-w-full w-full">
        {children}
      </div>
    </Section>
  );
};

const ColumnContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        'flex flex-col gap-6 overflow-hidden shrink-0 py-2',
        className
      )}
    >
      {children}
    </div>
  );
};

const ChartColumnContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <ColumnContainer className="md:col-span-7 lg:col-span-8 h-[300px] md:h-auto">
      {children}
    </ColumnContainer>
  );
};

const ItemsColumnContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <ColumnContainer className="md:col-span-5 lg:col-span-4">
      {children}
    </ColumnContainer>
  );
};
