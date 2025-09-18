import TotalTokensChart from '@/app/(app)/admin/_components/chart/TotalTokens';
import { Body, Heading } from '../../_components/layout/page-utils';

export default async function AdminDashboard(props: PageProps<'/admin'>) {
  return (
    <div>
      <Heading
        title="Admin Dashboard"
        description="An overview of what's happening on the Echo platform"
      />
      <Body>
        <TotalTokensChart />
      </Body>
    </div>
  );
}
