'use client';

import { ErrorScreen } from '@/components/error/screen';
import type { NextErrorProps } from '@/types/next-error';

export default function EarningsError(props: NextErrorProps) {
  return <ErrorScreen errorProps={props} />;
}
