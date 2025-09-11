'use client';

import { AppGroupError } from './_components/error/unknown-error';

import type { NextErrorProps } from '@/types/next-error';

export default function AppError(props: NextErrorProps) {
  return <AppGroupError errorProps={props} />;
}
