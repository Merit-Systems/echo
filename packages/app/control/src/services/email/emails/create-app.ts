import { z } from 'zod';

import { sendEmailWithRetry } from '../lib/send';

import { getFullUser } from '@/services/db/user/get';
import { countOwnerApps } from '@/services/db/apps/count';

import { logger } from '@/logger';
import { createEmail } from '@/services/db/emails';

export const createAppFollowUpEmailSchema = z.object({
  userId: z.uuid(),
  appId: z.uuid(),
  appName: z.string(),
});

export async function scheduleCreateAppFollowUpEmail(
  params: z.infer<typeof createAppFollowUpEmailSchema>
) {
  const { userId, appName, appId } = params;

  const user = await getFullUser(userId);

  if (!user) {
    throw new Error('User not found');
  }

  // Get count of apps the user has created (where they are the owner)
  const appCount = await countOwnerApps(userId);

  if (appCount > 2) {
    return null;
  }

  const { data, error } = await sendEmailWithRetry({
    to: [user.email],
    subject: 'Thanks for launching your app with Echo!',
    html: `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <p style="margin-bottom: 16px;">Hi ${user.name}, thanks for starting the process of launching ${appName} with Echo! We're excited to have you on board.</p>

      <p style="margin-bottom: 16px;">Echo was designed for monetizing your AI applications. We're here to help you get started and grow your business.</p>

      <p style="margin-bottom: 16px;">If you haven't already, finish setting up your app to start earning money.</p>

      <p style="margin-bottom: 16px;">Here's a link to the docs: <a href="https://echo.merit.systems/docs" target="_blank" style="color: #5865F2; text-decoration: none; font-weight: 500;">https://echo.merit.systems/docs</a></p>

      <p style="margin-bottom: 16px;">We'd love your feedback to help us improve, and you can also join our <a href="https://discord.gg/merit" target="_blank" style="color: #5865F2; text-decoration: none; font-weight: 500;">Discord</a> to connect with the community. Your input means a lot—hope to see you there!</p>
    </div>
    `,
    scheduledAt: 'in 1 hour', // Natural language scheduling
  });

  if (error) {
    logger.emit({
      severityText: 'ERROR',
      body: 'Email Error: Error sending create app follow up email',
      attributes: {
        error: error instanceof Error ? error.message : 'Unknown error',
        function: 'scheduleCreateAppFollowUpEmail',
        userId,
      },
    });
  }

  await createEmail({
    emailCampaignId: 'create-app-follow-up',
    userId,
    echoAppId: appId,
    createdAt: new Date(),
  });

  return data;
}
