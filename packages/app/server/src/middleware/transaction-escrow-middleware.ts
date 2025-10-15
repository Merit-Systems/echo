import { Request, Response } from 'express';
import { PrismaClient } from '../generated/prisma';
import logger, { logMetric } from '../logger';
import { EchoControlService } from '../services/EchoControlService';
import { getRequestId } from '../utils/trace';

const MAX_IN_FLIGHT_REQUESTS = Number(process.env.MAX_IN_FLIGHT_REQUESTS) || 10;
const CLEANUP_INTERVAL_MS = Number(process.env.CLEANUP_INTERVAL_MS) || 300000;
const REQUEST_TIMEOUT_MS = Number(process.env.REQUEST_TIMEOUT_MS) || 300000;

// Extended Request interface to store escrow context
export interface EscrowRequest extends Request {
  escrowContext?: {
    userId: string;
    echoAppId: string;
    effectiveBalance: number;
    requestId: string;
    startTime: number;
  };
  authContext?: {
    processedHeaders: Record<string, string>;
    echoControlService: EchoControlService;
  };
  // Preserve original content-length before body parsing middleware removes it
  originalContentLength?: string;
}

export class TransactionEscrowMiddleware {
  private readonly db: PrismaClient;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(db: PrismaClient) {
    this.db = db;
    this.startCleanupProcess();
  }
  /**
   * Handle in-flight request increment and setup cleanup
   */
  async handleInFlightRequestIncrement(
    req: EscrowRequest,
    res: Response
  ): Promise<void> {
    if (!req.escrowContext) {
      throw new Error('Escrow context not found on request');
    }

    const { userId, echoAppId, effectiveBalance, requestId } =
      req.escrowContext;

    // Increment in-flight requests or reject if limits exceeded
    await this.incrementInFlightRequestsOrReject(
      userId,
      echoAppId,
      effectiveBalance
    );

    this.setupResponseCleanup(res, userId, echoAppId, requestId);
  }

  /**
   * Sets up the escrow context on the request object
   */
  setupEscrowContext(
    req: EscrowRequest,
    userId: string,
    echoAppId: string,
    effectiveBalance: number
  ) {
    req.escrowContext = {
      userId,
      echoAppId,
      effectiveBalance,
      requestId: this.generateRequestId(),
      startTime: Date.now(),
    };
  }

  /**
   * Increment in-flight requests with proper validation
   */
  private async incrementInFlightRequestsOrReject(
    userId: string,
    echoAppId: string,
    _effectiveBalance: number
  ): Promise<void> {
    await this.db.$transaction(async tx => {
      // Get current in-flight request count
      const currentInFlightRequest = await tx.inFlightRequest.findUnique({
        where: {
          userId_echoAppId: {
            userId,
            echoAppId,
          },
        },
      });

      // Check rate limits
      if (
        currentInFlightRequest &&
        currentInFlightRequest.numberInFlight >= MAX_IN_FLIGHT_REQUESTS
      ) {
        logMetric('max_in_flight_requests_hit', 1, {
          userId,
          echoAppId,
          currentInFlightRequest: currentInFlightRequest.numberInFlight,
        });

        logger.warn('Max in-flight requests limit reached', {
          userId,
          echoAppId,
          currentInFlightRequest: currentInFlightRequest.numberInFlight,
          event: 'max_in_flight_requests_hit',
        });
      }

      // // Check balance constraints
      // const estimatedCost =
      //   (currentInFlightRequest?.numberInFlight || 0) *
      //   ESTIMATED_COST_PER_TRANSACTION;

      // if (estimatedCost >= effectiveBalance) {
      //   throw new PaymentRequiredError(
      //     'Insufficient balance for concurrent requests'
      //   );
      // }

      // Atomically increment the counter
      await tx.inFlightRequest.upsert({
        where: {
          userId_echoAppId: {
            userId,
            echoAppId,
          },
        },
        update: {
          numberInFlight: { increment: 1 },
          updatedAt: new Date(),
        },
        create: {
          userId,
          echoAppId,
          numberInFlight: 1,
        },
      });
    });
  }

  /**
   * Decrement in-flight requests safely
   */
  private async decrementInFlightRequests(
    userId: string,
    echoAppId: string
  ): Promise<void> {
    try {
      await this.db.$transaction(async tx => {
        const inFlightRequest = await tx.inFlightRequest.findUnique({
          where: {
            userId_echoAppId: {
              userId,
              echoAppId,
            },
          },
        });

        if (!inFlightRequest) {
          return;
        }

        if (inFlightRequest.numberInFlight <= 0) {
          return;
        }

        // Use updateMany to avoid throwing error if record doesn't exist
        await tx.inFlightRequest.updateMany({
          where: {
            userId,
            echoAppId,
            numberInFlight: { gt: 0 }, // Only update if numberInFlight > 0
          },
          data: {
            numberInFlight: { decrement: 1 },
            updatedAt: new Date(),
          },
        });
      });
    } catch (error) {
      logger.warn(
        `Failed to decrement in-flight requests for ${userId}/${echoAppId}: ${error}. This may be due to concurrent cleanup operations.`
      );
    }
  }

  private executeCleanup = async (
    userId: string,
    echoAppId: string,
    requestId: string,
    cleanupExecuted: boolean
  ) => {
    if (cleanupExecuted) return;
    cleanupExecuted = true;

    // decrementInFlightRequests now handles its own errors gracefully
    await this.decrementInFlightRequests(userId, echoAppId);
  };

  /**
   * Set up automatic cleanup when response finishes
   */
  private setupResponseCleanup(
    res: Response,
    userId: string,
    echoAppId: string,
    requestId: string
  ) {
    const cleanupExecuted = false;

    // Cleanup on response finish (normal case)
    res.on('finish', () =>
      this.executeCleanup(userId, echoAppId, requestId, cleanupExecuted)
    );

    // Cleanup on response close (client disconnect)
    res.on('close', () =>
      this.executeCleanup(userId, echoAppId, requestId, cleanupExecuted)
    );

    // Cleanup on error (if response errors out)
    res.on('error', () =>
      this.executeCleanup(userId, echoAppId, requestId, cleanupExecuted)
    );
  }

  /**
   * Cleanup orphaned in-flight requests (requests that started but never finished)
   */
  private async cleanupOrphanedRequests(): Promise<void> {
    try {
      const cutoffTime = new Date(Date.now() - REQUEST_TIMEOUT_MS);

      // Bulk update all orphaned requests
      const result = await this.db.inFlightRequest.updateMany({
        where: {
          numberInFlight: { gt: 0 },
          updatedAt: { lt: cutoffTime },
        },
        data: {
          numberInFlight: 0,
          updatedAt: new Date(),
        },
      });

      if (result.count > 0) {
        logger.info(`Cleaned up ${result.count} orphaned in-flight requests`, {
          cutoffTime,
          cleanedCount: result.count,
        });
        logMetric('escrow.orphaned_requests_cleaned', result.count);
      }
    } catch (error) {
      logger.error('Failed to cleanup orphaned requests', {
        error,
      });
      logMetric('escrow.cleanup_failed', 1, {
        error_message: error instanceof Error ? error.message : 'unknown',
      });
      // Don't rethrow - we want the cleanup process to continue on next interval
    }
  }

  /**
   * Start the background cleanup process
   */
  private startCleanupProcess(): void {
    this.cleanupInterval = setInterval(async () => {
      await this.cleanupOrphanedRequests();
    }, CLEANUP_INTERVAL_MS);
  }

  /**
   * Stop the cleanup process (for graceful shutdown)
   */
  stopCleanupProcess(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Generate a request ID from OpenTelemetry trace context
   */
  private generateRequestId(): string {
    return getRequestId();
  }
}
