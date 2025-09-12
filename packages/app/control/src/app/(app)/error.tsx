'use client';

import { AppGroupError } from './_components/error/unknown-error';

import { NextErrorProps } from '@/types/next-error';

export default function AppError(props: NextErrorProps) {
  return <AppGroupError errorProps={props} />;
}
