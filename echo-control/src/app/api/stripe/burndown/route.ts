/// Generates an invoice for the user to purchase credits granted via stripe

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { userId } = await request.json();
}
