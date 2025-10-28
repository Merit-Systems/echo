import { Resend } from 'resend';

import { env } from '@/env';

export const emailClient = env.AUTH_RESEND_KEY
  ? new Resend(env.AUTH_RESEND_KEY)
  : null;
