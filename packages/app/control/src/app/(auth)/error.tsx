'use client';

import { ErrorScreen } from '@/components/error/screen';

import type { NextErrorProps } from '@/types/next-error';

export default function AuthError(props: NextErrorProps) {
  return <ErrorScreen className="pb-10 md:pb-[15vh]" errorProps={props} />;
}
