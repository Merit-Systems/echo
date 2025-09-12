import { db } from '@/lib/db';
import { scheduleCreateAppFollowUpEmail } from '@/services/email/create-app';
import { scheduleLimboAppReminderEmail } from '@/services/email/limbo-app-reminder';

export type EmailCampaign = {
  key: string;
  label: string;
  description?: string;
};

export const AVAILABLE_EMAIL_CAMPAIGNS: EmailCampaign[] = [
  { key: 'limbo-app-reminder', label: 'Limbo App Reminder' },
  { key: 'create-app-follow-up', label: 'Create App Follow-Up' },
];

export function listAvailableEmailCampaigns(): EmailCampaign[] {
  return AVAILABLE_EMAIL_CAMPAIGNS;
}

export async function getSentCampaignsForApps(appIds: string[]) {
  if (!appIds.length) return {} as Record<string, string[]>;

  const records = await db.outboundEmailSent.findMany({
    where: { echoAppId: { in: appIds } },
    select: { echoAppId: true, emailCampaignId: true },
  });

  const appIdToCampaigns = new Map<string, Set<string>>();
  for (const rec of records) {
    if (!rec.echoAppId) continue;
    const set = appIdToCampaigns.get(rec.echoAppId) ?? new Set<string>();
    set.add(rec.emailCampaignId);
    appIdToCampaigns.set(rec.echoAppId, set);
  }

  const result: Record<string, string[]> = {};
  for (const appId of appIds) {
    result[appId] = Array.from(appIdToCampaigns.get(appId) ?? []);
  }
  return result;
}

export async function scheduleCampaignForApps(params: {
  campaignKey: string;
  appIds: string[];
}) {
  const { campaignKey, appIds } = params;
  const results: Array<{
    appId: string;
    status: 'scheduled' | 'skipped' | 'error';
    message?: string;
  }> = [];

  for (const appId of appIds) {
    // Fetch an owner and app info
    const membership = await db.appMembership.findFirst({
      where: { echoAppId: appId, role: 'owner', isArchived: false },
      include: { user: true, echoApp: true },
    });

    if (!membership || !membership.user || !membership.echoApp) {
      results.push({
        appId,
        status: 'error',
        message: 'Owner or app not found',
      });
      continue;
    }

    try {
      if (campaignKey === 'limbo-app-reminder') {
        await scheduleLimboAppReminderEmail(
          membership.user.id,
          membership.echoApp.name,
          appId
        );
      } else if (campaignKey === 'create-app-follow-up') {
        await scheduleCreateAppFollowUpEmail(
          membership.user.id,
          membership.echoApp.name,
          appId
        );
      } else {
        results.push({
          appId,
          status: 'error',
          message: 'Unknown campaign key',
        });
        continue;
      }

      results.push({ appId, status: 'scheduled' });
    } catch (err) {
      results.push({
        appId,
        status: 'error',
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return results;
}
