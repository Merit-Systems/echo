import { getOverallStats } from '../_lib/fetch';

import { Users, DollarSign, Brain } from '@/components/og/icons';

import { appOgImage } from '@/components/og/images/app';

export default async function Image({ params }: PageProps<'/app/[id]'>) {
  const { id } = await params;
  const overallStats = await getOverallStats(id);

  return appOgImage(
    id,
    <div tw="flex text-black text-4xl justify-between">
      <div tw="flex items-center" style={{ color: '#009dc8' }}>
        <DollarSign style={{ height: '48px', width: '48px' }} />
        <span tw="font-medium ml-2">
          {overallStats.totalProfit.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
            notation: 'compact',
          })}{' '}
          Profit
        </span>
      </div>
      <div tw="flex items-center">
        <Brain style={{ height: '48px', width: '48px' }} />
        <span tw="font-medium ml-4">
          {overallStats.numUsers.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
            notation: 'compact',
          })}{' '}
          Users
        </span>
      </div>
      <div tw="flex items-center">
        <Users style={{ height: '48px', width: '48px' }} />
        <span tw="font-medium ml-4">
          {overallStats.transactionCount.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
            notation: 'compact',
          })}{' '}
          Requests
        </span>
      </div>
    </div>
  );
}
