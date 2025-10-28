import z from 'zod';

import {
  limboAppReminderEmailSchema,
  scheduleLimboAppReminderEmail,
} from './emails/limbo-app-reminder';
import {
  createAppFollowUpEmailSchema,
  scheduleCreateAppFollowUpEmail,
} from './emails/create-app';

import { queueClient } from '@/services/queue/client';

import { env } from '@/env';

import { EmailType } from './emails/types';

export const emailJobSchema = z.discriminatedUnion('campaign', [
  z.object({
    campaign: z.literal(EmailType.LIMBO_APP_REMINDER),
    payload: limboAppReminderEmailSchema,
  }),
  z.object({
    campaign: z.literal(EmailType.CREATE_APP_FOLLOW_UP),
    payload: createAppFollowUpEmailSchema,
  }),
]);

export const queueJob = async (body: z.infer<typeof emailJobSchema>) => {
  // Skip queueing in local development mode
  if (env.NODE_ENV === 'development' || !env.RESEND_FLOW_CONTROL_KEY) {
    return;
  }

  await queueClient.publishJSON({
    url: `${env.NEXT_PUBLIC_APP_URL}/api/jobs`,
    body: {
      type: 'email',
      job: body,
    },
    flowControl: {
      key: env.RESEND_FLOW_CONTROL_KEY,
      rate: 2,
      period: '1m',
    },
  });
};

export function processJob(input: z.infer<typeof emailJobSchema>) {
  const parsed = emailJobSchema.parse(input);

  switch (parsed.campaign) {
    case EmailType.LIMBO_APP_REMINDER: {
      return scheduleLimboAppReminderEmail(parsed.payload);
    }
    case EmailType.CREATE_APP_FOLLOW_UP: {
      return scheduleCreateAppFollowUpEmail(parsed.payload);
    }
  }
}
