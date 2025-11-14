import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../server';
import { authenticateRequest } from '../auth';
import logger from '../logger';
import { UnauthorizedError } from '../errors/http';
import { env } from '../env';

const inFlightMonitorRouter: Router = Router();

/**
 * GET /in-flight-requests
 * Returns the current number of in-flight requests for the authenticated user and app
 *
 * Authentication: Requires valid API key in Authorization header (Bearer token)
 *
 * Response format:
 * {
 *   "userId": "string",
 *   "echoAppId": "string",
 *   "numberInFlight": number,
 *   "lastUpdated": "ISO date string | null",
 *   "maxAllowed": number
 * }
 *
 * Example usage:
 * curl -H "Authorization: Bearer your-api-key" http://localhost:3069/in-flight-requests
 */
inFlightMonitorRouter.get(
  '/in-flight-requests',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Authenticate the request using the same flow as the main server
      const authResult = await authenticateRequest(
        req.headers as Record<string, string>,
        prisma
      );
      
      if (authResult.isErr()) {
        throw new UnauthorizedError('Unauthorized Access');
      }

      const { echoControlService } = authResult.value;

      const userId = echoControlService.getUserId();
      const echoAppId = echoControlService.getEchoAppId();

      if (!userId || !echoAppId) {
        throw new UnauthorizedError('Unauthorized Access');
      }

      // Fetch the current in-flight request count
      const inFlightRequest = await prisma.inFlightRequest.findUnique({
        where: {
          userId_echoAppId: {
            userId,
            echoAppId,
          },
        },
      });

      const response = {
        userId,
        echoAppId,
        numberInFlight: inFlightRequest?.numberInFlight ?? 0,
        lastUpdated: inFlightRequest?.updatedAt ?? null,
        maxAllowed: Number(env.MAX_IN_FLIGHT_REQUESTS) || 10,
      };

      logger.info(
        `Retrieved in-flight requests for user ${userId} and app ${echoAppId}: ${response.numberInFlight}`
      );

      res.status(200).json(response);
    } catch (error) {
      return next(error);
    }
  }
);

export default inFlightMonitorRouter;
