import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/echo';
import { db } from '@/lib/db';

export async function GET() {
  const user = await getUser();
  
  if (!user) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
  }

  const existingUser = await db.user.findUnique({
    where: { email: user.email }
  });

  if (!existingUser) {
    return NextResponse.json({
      requiresSetup: true,
      message: 'Please fill out the form to complete your profile setup.',
      user: { email: user.email }
    });
  }

  return NextResponse.json({
    requiresSetup: false,
    user: {
      id: existingUser.id,
      email: existingUser.email,
      hasApiKey: !!existingUser.apiKey
    }
  });
}

export async function POST(request: NextRequest) {
  const user = await getUser();
  
  if (!user) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => null);
  
  if (!body || !body.apiKey) {
    return NextResponse.json(
      { error: 'API key is required' },
      { status: 400 }
    );
  }

  const existingUser = await db.user.findUnique({
    where: { email: user.email }
  });

  if (existingUser) {
    return NextResponse.json(
      { error: 'User already exists' },
      { status: 409 }
    );
  }

  const existingApiKey = await db.user.findUnique({
    where: { apiKey: body.apiKey }
  });

  if (existingApiKey) {
    return NextResponse.json(
      { error: 'API key already in use' },
      { status: 409 }
    );
  }

  const newUser = await db.user.create({
    data: {
      email: user.email,
      apiKey: body.apiKey
    }
  });

  return NextResponse.json({
    success: true,
    user: {
      id: newUser.id,
      email: newUser.email,
      hasApiKey: true
    }
  });
}
