import { Resend } from 'resend';
import { logger } from '@/logger';
import { db } from '@/lib/db';

// When user performs action, schedule email for 1 hour later
export async function scheduleCreateAppFollowUpEmail(
  userId: string,
  appName: string
) {
  const resend = new Resend(process.env.AUTH_RESEND_KEY);
  const fromEmail = process.env.AUTH_RESEND_FROM_EMAIL!;
  const user = await db.user.findUnique({
    where: { id: userId },
  });

  // Get count of apps the user has created (where they are the owner)
  const appCount = await db.appMembership.count({
    where: {
      userId: userId,
      role: 'owner',
      isArchived: false,
      echoApp: {
        isArchived: false,
      },
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  if (appCount > 2) {
    return;
  }

  const { data, error } = await resend.emails.send({
    from: `Sam Ragsdale <${fromEmail}>`,
    to: [user.email],
    subject: 'Thanks for launching your app with Echo!',
    html: `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <p style="margin-bottom: 16px;">Hi ${user.name}, thanks for starting the process of launching ${appName} with Echo! We're excited to have you on board.</p>

      <p style="margin-bottom: 16px;">Echo was designed for monetizing your AI applications. We're here to help you get started and grow your business.</p>

      <p style="margin-bottom: 16px;">If you haven't already, finish setting up your app to start earning money.</p>

      <p style="margin-bottom: 16px;">Here's a link to the docs: <a href="https://echo.merit.systems/docs" target="_blank" style="color: #5865F2; text-decoration: none; font-weight: 500;">https://echo.merit.systems/docs</a></p>

      <p style="margin-bottom: 16px;">We'd love your feedback to help us improve, and you can also join our <a href="https://discord.com/invite/JuKt7tPnNc" target="_blank" style="color: #5865F2; text-decoration: none; font-weight: 500;">Discord</a> to connect with the community. Your input means a lot—hope to see you there!</p>
    </div>
    `,
    scheduledAt: 'in 1 hour', // Natural language scheduling
  });

  if (error) {
    logger.emit({
      severityText: 'ERROR',
      body: 'Error sending create app follow up email',
      attributes: {
        error: error.message,
        function: 'scheduleCreateAppFollowUpEmail',
        userId,
      },
    });
  }
  return data;
}
