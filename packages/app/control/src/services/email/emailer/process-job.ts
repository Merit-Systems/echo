import { scheduleCreateAppFollowUpEmail } from '../create-app';
import { scheduleLimboAppReminderEmail } from '../limbo-app-reminder';
import { EmailCampaign, EmailJobPayload, EmailJobPayloadSchema } from './types';

export function processJob(input: EmailJobPayload) {
  const parsed = EmailJobPayloadSchema.parse(input);

  switch (parsed.campaign) {
    case EmailCampaign.LIMBO_APP_REMINDER: {
      return scheduleLimboAppReminderEmail(parsed.payload);
    }
    case EmailCampaign.CREATE_APP_FOLLOW_UP: {
      return scheduleCreateAppFollowUpEmail(parsed.payload);
    }
  }
}
