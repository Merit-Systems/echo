import { NextResponse } from 'next/server';
import { logger } from '@/logger';

export async function GET() {
  try {
    logger.emit({
      severityText: 'INFO',
      body: 'Health check successful',
      attributes: {},
    });
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.emit({
      severityText: 'ERROR',
      body: 'Health check failed',
      attributes: {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
    });

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
