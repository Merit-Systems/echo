import { NextResponse } from 'next/server';
import { getSupportedModels } from '@/lib/supported-models';

export async function GET() {
  try {
    const supportedModels = await getSupportedModels();
    return NextResponse.json(supportedModels);
  } catch (error) {
    console.error('Error reading model prices:', error);
    return NextResponse.json(
      { error: 'Failed to load supported models' },
      { status: 500 }
    );
  }
}
