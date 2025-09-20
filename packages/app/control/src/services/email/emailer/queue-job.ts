import { qstashClient } from '@/lib/qstash';
import { EmailJobPayload } from './types';
import { env } from '@/env';

export async function queueJob(body: EmailJobPayload) {
  await qstashClient.publishJSON({
    url: `${env.NEXT_PUBLIC_APP_URL}/api/jobs`,
    body,
    flowControl: {
      key: env.RESEND_FLOW_CONTROL_KEY,
      rate: 2,
      period: '1m',
    },
  });
}
