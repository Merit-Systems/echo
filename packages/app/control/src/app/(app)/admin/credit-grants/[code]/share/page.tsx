import QRCode from 'react-qr-code';

import { Logo } from '@/components/ui/logo';
import { Card } from '@/components/ui/card';

import { Body, Heading } from '@/app/(app)/_components/layout/page-utils';
import {
  CouponContainer,
  CouponDescription,
  CouponDivider,
  CouponFooter,
  CouponHeader,
  CouponLabel,
  CouponMarquee,
  CouponTitle,
  CouponValue,
} from '@/components/coupon';

import { ShareButton } from './_components/share-button';
import { formatCurrency } from '@/lib/utils';
import { checkCreditGrant } from '../_lib/checks';
import { env } from '@/env';

export default async function AdminCodePage(
  props: PageProps<'/admin/credit-grants/[code]/share'>
) {
  const { code } = await props.params;

  const creditGrant = await checkCreditGrant(code);

  return (
    <div>
      <Heading
        title="Free Credits"
        description={`Scan this QR code to claim ${formatCurrency(creditGrant.grantAmount)} of Echo credits`}
      />
      <Body>
        <div className="grid grid-cols-1 lg:grid-cols-3 items-center gap-4 lg:gap-8">
          <Card className="aspect-square shrink-0 rounded-xl border overflow-hidden relative p-4">
            <QRCode
              value={`${env.NEXT_PUBLIC_APP_URL}/credits/claim/${code}`}
              className="size-full"
            />
            <Card className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card p-2 rounded-xl border-primary border-4">
              <Logo className="size-12" />
            </Card>
          </Card>
          <CouponContainer className="col-span-1 lg:col-span-2 h-full flex flex-col justify-between">
            <CouponHeader>
              <CouponTitle>
                <CouponValue value={creditGrant.grantAmount} />
                <CouponLabel />
              </CouponTitle>
              <CouponDescription />
            </CouponHeader>
            <CouponMarquee size={48} />
            <CouponDivider />
            <CouponFooter>
              <ShareButton
                url={`${env.NEXT_PUBLIC_APP_URL}/credits/claim/${code}`}
              />
            </CouponFooter>
          </CouponContainer>
        </div>
      </Body>
    </div>
  );
}
