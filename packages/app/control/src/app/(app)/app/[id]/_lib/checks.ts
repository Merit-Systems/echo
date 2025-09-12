import { forbidden, notFound } from 'next/navigation';
import { getApp, getIsOwner } from './fetch';

export const checkAppExists = async (id: string) => {
  try {
    return await getApp(id);
  } catch {
    return notFound();
  }
};

export const checkIsAppOwner = async (id: string) => {
  try {
    const isOwner = await getIsOwner(id);
    if (!isOwner) {
      return forbidden();
    }
  } catch {
    return forbidden();
  }
};
