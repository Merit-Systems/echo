import { db } from '@/lib/db';

export const getPublicUser = async (userId: string) => {
  return await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      image: true,
      createdAt: true,
    },
  });
};

export const getFullUser = async (userId: string) => {
  return await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      image: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};
