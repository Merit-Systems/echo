import { db } from '@/lib/db';
import type { UserId } from '../lib/schemas';
import type { FeedActivity} from './types';
import { FeedActivityType } from './types';
import z from 'zod';
import type {
  TimeBasedPaginationParams} from '../lib/pagination';
import {
  toTimeBasedPaginatedReponse,
} from '../lib/pagination';
import { appIdSchema } from '../apps/lib/schemas';

export const userFeedSchema = z.object({
  numHours: z.number().default(1),
  appIds: appIdSchema.array().default([]),
  startDate: z.date().default(new Date(0)),
  endDate: z.date().default(new Date()),
  eventTypes: z
    .array(z.enum(FeedActivityType))
    .default(Object.values(FeedActivityType)),
});

export const getUserFeed = async (
  userId: UserId,
  {
    numHours,
    appIds,
    startDate,
    endDate,
    eventTypes,
  }: z.infer<typeof userFeedSchema>,
  { cursor, limit }: TimeBasedPaginationParams
) => {
  const items = await db.$queryRaw<FeedActivity[]>`
    SELECT 
      timestamp,
      app,
      activity_type,
      event_data,
      users
    FROM (
      -- Transaction events (simplified)
      SELECT 
        timestamp,
        JSON_BUILD_OBJECT(
          'id', "echoAppId",
          'name', app_name,
          'profilePictureUrl', app_profile_picture
        ) as app,
        'transaction' as activity_type,
        JSON_BUILD_OBJECT(
          'total_transactions', SUM(transaction_count),
          'total_profit', SUM(total_profit)
        ) as event_data,
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'userId', "userId",
            'userName', user_name,
            'userProfilePicture', user_image
          )
        ) as users
      FROM (
        SELECT
          timestamp,
          "echoAppId",
          app_name,
          app_profile_picture,
          "userId",
          user_name,
          user_image,
          COUNT(*) as transaction_count,
          SUM("markUpProfit") as total_profit
        FROM (
          SELECT 
            DATE_TRUNC('day', t."createdAt") + 
              (FLOOR(EXTRACT(HOUR FROM t."createdAt") / ${numHours}) * interval '${numHours} hours') AS timestamp,
            t."echoAppId",
            app.name as app_name,
            app."profilePictureUrl" as app_profile_picture,
            t."userId",
            u.name as user_name,
            u.image as user_image,
            t."markUpProfit"
          FROM transactions t
          INNER JOIN app_memberships am ON t."echoAppId" = am."echoAppId" 
            AND am."userId" = ${userId}::uuid
            AND am.role = 'owner'
            AND am."isArchived" = false
          INNER JOIN users u ON t."userId" = u.id
          INNER JOIN echo_apps app ON t."echoAppId" = app.id
          WHERE t."isArchived" = false
            AND DATE_TRUNC('day', t."createdAt") + 
              (FLOOR(EXTRACT(HOUR FROM t."createdAt") / ${numHours}) * interval '${numHours} hours') < ${cursor}
            AND (t."echoAppId" = ANY(STRING_TO_ARRAY(${appIds.join(',')}::text, ',')::uuid[]) OR ${appIds.length === 0})
            AND t."createdAt" >= ${startDate}
            AND t."createdAt" <= ${endDate}
            AND ${eventTypes.includes(FeedActivityType.TRANSACTION)}
        ) all_transactions
        GROUP BY timestamp, "echoAppId", app_name, app_profile_picture, "userId", user_name, user_image
      ) user_aggregated_transactions
      GROUP BY timestamp, "echoAppId", app_name, app_profile_picture
      
      UNION ALL
      
      -- Signin events
      SELECT 
        timestamp,
        JSON_BUILD_OBJECT(
          'id', "echoAppId",
          'name', app_name,
          'profilePictureUrl', app_profile_picture
        ) as app,
        'signin' as activity_type,
        JSON_BUILD_OBJECT(
          'total_users', COUNT(*)
        ) as event_data,
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'userId', "userId",
            'userName', user_name,
            'userProfilePicture', user_image
          )
        ) as users
      FROM (
        SELECT DISTINCT
          DATE_TRUNC('day', rt."createdAt") + 
            (FLOOR(EXTRACT(HOUR FROM rt."createdAt") / ${numHours}) * interval '${numHours} hours') AS timestamp,
          rt."echoAppId",
          app.name as app_name,
          app."profilePictureUrl" as app_profile_picture,
          rt."userId",
          u.name as user_name,
          u.image as user_image
        FROM refresh_tokens rt
        INNER JOIN app_memberships am ON rt."echoAppId" = am."echoAppId" 
          AND am."userId" = ${userId}::uuid
          AND am.role = 'owner'
          AND am."isArchived" = false
        INNER JOIN users u ON rt."userId" = u.id
        INNER JOIN echo_apps app ON rt."echoAppId" = app.id
        WHERE DATE_TRUNC('day', rt."createdAt") + 
          (FLOOR(EXTRACT(HOUR FROM rt."createdAt") / ${numHours}) * interval '${numHours} hours') < ${cursor}
          AND (rt."echoAppId" = ANY(STRING_TO_ARRAY(${appIds.join(',')}::text, ',')::uuid[]) OR ${appIds.length === 0})
          AND rt."createdAt" >= ${startDate}
          AND rt."createdAt" <= ${endDate}
          AND ${eventTypes.includes(FeedActivityType.SIGNIN)}
      ) distinct_signins
      GROUP BY timestamp, "echoAppId", app_name, app_profile_picture
    ) combined_activity
    ORDER BY timestamp DESC, app->>'id', activity_type
    LIMIT ${limit + 1}
  `;

  return toTimeBasedPaginatedReponse({
    items,
    cursor,
    limit,
  });
};
