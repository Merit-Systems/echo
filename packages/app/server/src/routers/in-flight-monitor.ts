import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../server';
import { authenticateRequest } from '../auth';
import logger from '../logger';
import { UnauthorizedError } from '../errors/http';
import { ResultAsync, err } from 'neverthrow';

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
    const headers = req.headers as Record<string, string>;

    const result = await ResultAsync.fromPromise(
      authenticateRequest(headers, prisma),
      e => e as unknown
    ).andThen(({ echoControlService }) => {
      const userId = echoControlService.getUserId();
      const echoAppId = echoControlService.getEchoAppId();

      if (!userId || !echoAppId) {
        return err(new UnauthorizedError('Unauthorized Access'));
      }

      return ResultAsync.fromPromise(
        prisma.inFlightRequest.findUnique({
          where: {
            userId_echoAppId: {
              userId,
              echoAppId,
            },
          },
        }),
        e => e as unknown
      ).map(inFlightRequest => {
        const response = {
          userId,
          echoAppId,
          numberInFlight: inFlightRequest?.numberInFlight ?? 0,
          lastUpdated: inFlightRequest?.updatedAt ?? null,
          maxAllowed: Number(process.env.MAX_IN_FLIGHT_REQUESTS) || 10,
        };

        logger.info(
          `Retrieved in-flight requests for user ${userId} and app ${echoAppId}: ${response.numberInFlight}`
        );

        return response;
      });
    });

    result.match(
      response => res.status(200).json(response),
      error => next(error as Error)
    );
  }
);

export default inFlightMonitorRouter;
