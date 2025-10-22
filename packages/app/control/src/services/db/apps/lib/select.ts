import type { Prisma } from '@/generated/prisma';

export const appSelect = {
  id: true,
  name: true,
  description: true,
  profilePictureUrl: true,
  bannerImageUrl: true,
  homepageUrl: true,
  isPublic: true,
  hideOwnerName: true,
  createdAt: true,
  updatedAt: true,
  authorizedCallbackUrls: true,
} satisfies Prisma.EchoAppSelect;
