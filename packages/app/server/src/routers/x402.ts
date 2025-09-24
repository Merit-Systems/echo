import { NextFunction, Request, Response, Router } from 'express';
import { settle, verify } from 'x402/facilitator';
import { authenticateRequest } from '../auth';
import { PrismaClient } from '../generated/prisma';
import logger from '../logger';

const createX402Router = (prisma: PrismaClient) => {
  const x402Router = Router();

  // X402 Facilitator Verify Endpoint
  // Used to verify payment proofs and authorize access
  x402Router.post(
    '/verify',
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { echoControlService } = await authenticateRequest(
          req.headers as Record<string, string>,
          prisma
        );

        const result = await verify(echoControlService, req.body);

        return res.json(result);
      } catch (error) {
        logger.error('X402 verify error:', error);
        res.status(500).json({
          error: 'Verification failed',
        });
        return next(error);
      }
    }
  );

  // X402 Facilitator Settle Endpoint
  // Used to settle payments and finalize transactions
  x402Router.post(
    '/settle',
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { echoControlService } = await authenticateRequest(
          req.headers as Record<string, string>,
          prisma
        );

        // TODO: the server can fully just spend as much as they want here,
        // the client isn't signing anything to enforce the amount is correct
        const result = await settle(echoControlService, req.body);

        return res.json(result);
      } catch (error) {
        logger.error('X402 settle error:', error);
        res.status(500).json({
          error: 'Settlement failed',
        });
        return next(error);
      }
    }
  );

  return x402Router;
};

export default createX402Router;
