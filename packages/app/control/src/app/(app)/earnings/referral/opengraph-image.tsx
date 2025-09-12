import { ogExports } from '@/components/og/exports';
import { staticPage } from '@/components/og/images/home';

export const { alt, size, contentType } = ogExports('Referral Earnings');

export default async function Image() {
  return staticPage({
    title: 'Referral Earnings',
    description: 'View and claim your referral earnings.',
  });
}
