import { NextResponse } from 'next/server';
import { authRoute } from '../../../../lib/api/auth-route';
import { getFullUser } from '@/services/user/get';

export const GET = authRoute.handler(async (_, context) => {
  const user = await getFullUser(context.ctx.userId);
  if (!user) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }
  return NextResponse.json(user);
});
