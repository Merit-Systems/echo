import { Body } from '../../../_components/layout/page-utils';
import { LoadingOverview } from './_components/overview';
import { LoadingHeaderCard } from './_components/header';

export default function LoadingAppPage() {
  return (
    <Body className="pt-0 gap-0">
      <LoadingHeaderCard />
      <LoadingOverview />
    </Body>
  );
}
