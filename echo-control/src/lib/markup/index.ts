import { db } from '../db';
import { Markup } from '@/generated/prisma';

/**
 * Get the current markup for an app
 * @param appId - The app ID
 * @returns The current markup rate or null if none set
 */
export async function getCurrentMarkup(appId: string): Promise<number | null> {
  const app = await db.echoApp.findUnique({
    where: { id: appId },
    include: {
      currentMarkup: true,
    },
  });

  return app?.currentMarkup?.rate ? Number(app.currentMarkup.rate) : null;
}

/**
 * Create a new markup for an app
 * @param appId - The app ID
 * @param rate - The markup rate (multiplier, e.g., 1.5 for 50% markup)
 * @param name - Optional name for the markup
 * @param isDefault - Whether this should be the default markup
 * @returns The created markup
 */
export async function createMarkup(
  appId: string,
  rate: number,
  name?: string,
  isDefault: boolean = false
): Promise<Markup> {
  // Validate rate
  if (rate < 1.0) {
    throw new Error('Markup rate must be 1.0 or higher');
  }

  // Create the markup
  const markup = await db.markup.create({
    data: {
      rate,
      name,
      isDefault,
      echoAppId: appId,
    },
  });

  return markup;
}

/**
 * Set the current markup for an app
 * @param appId - The app ID
 * @param rate - The markup rate (multiplier, e.g., 1.5 for 50% markup)
 * @param name - Optional name for the markup
 * @returns The updated app with the new current markup
 */
export async function setCurrentMarkup(
  appId: string,
  rate: number,
  name?: string
) {
  // Validate rate
  if (rate < 1.0) {
    throw new Error('Markup rate must be 1.0 or higher');
  }

  // Use a transaction to ensure consistency
  return await db.$transaction(async tx => {
    // Create new markup
    const newMarkup = await tx.markup.create({
      data: {
        rate,
        name: name || `Markup ${rate}x`,
        isActive: true,
        isDefault: true,
        echoAppId: appId,
      },
    });

    // Update app to use this markup as current
    const updatedApp = await tx.echoApp.update({
      where: { id: appId },
      data: {
        currentMarkupId: newMarkup.id,
      },
      include: {
        currentMarkup: true,
      },
    });

    // Deactivate other markups for this app
    await tx.markup.updateMany({
      where: {
        echoAppId: appId,
        id: { not: newMarkup.id },
      },
      data: {
        isDefault: false,
      },
    });

    return {
      app: updatedApp,
      markup: newMarkup,
    };
  });
}

/**
 * Get all markups for an app
 * @param appId - The app ID
 * @returns Array of markups for the app
 */
export async function getAppMarkups(appId: string): Promise<Markup[]> {
  return await db.markup.findMany({
    where: {
      echoAppId: appId,
      isArchived: false,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

/**
 * Delete a markup (soft delete)
 * @param markupId - The markup ID
 * @returns The archived markup
 */
export async function deleteMarkup(markupId: string): Promise<Markup> {
  return await db.markup.update({
    where: { id: markupId },
    data: {
      isArchived: true,
      archivedAt: new Date(),
      isActive: false,
      isDefault: false,
    },
  });
}
