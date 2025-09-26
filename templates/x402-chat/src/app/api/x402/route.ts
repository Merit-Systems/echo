import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'You have paid the troll toll, the password is "jeebus"',
  });
}
