import { verifySignatureAppRouter } from '@upstash/qstash/nextjs';
import { JobEnvelopeSchema, JobType } from '@/services/email/emailer/types';
import { processJob as processEmailJob } from '@/services/email/emailer/process-job';

import { env } from '@/env';

async function handler(request: Request) {
  const candidate = await request.json().catch(() => null);
  if (!candidate) {
    return Response.json(
      { success: false, error: 'Invalid JSON' },
      { status: 400 }
    );
  }

  const parsed = JobEnvelopeSchema.safeParse(candidate);
  if (!parsed.success) {
    return Response.json(
      { success: false, error: parsed.error.format() },
      { status: 400 }
    );
  }

  const envelope = parsed.data;

  switch (envelope.type) {
    case JobType.EMAIL: {
      processEmailJob(envelope.job);
      return Response.json({ success: true });
    }
    default: {
      return Response.json(
        { success: false, error: 'Unsupported job type' },
        { status: 400 }
      );
    }
  }
}

export const POST = verifySignatureAppRouter(handler, {
  currentSigningKey: env.QSTASH_CURRENT_SIGNING_KEY,
  nextSigningKey: env.QSTASH_NEXT_SIGNING_KEY,
});
