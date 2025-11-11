import { MarkUp, PrismaClient } from '../generated/prisma';
import { EchoDbService } from './DbService';
import { EchoApp, Transaction, TransactionCosts } from '../types';
import { EchoControlService } from './EchoControlService';
import logger from 'logger';
import { env } from '../env';

export class X402AuthenticationService {
  private readonly dbService: EchoDbService;
  private readonly echoControlService: EchoControlService;

  constructor(prisma: PrismaClient) {
    this.dbService = new EchoDbService(prisma);
    this.echoControlService = new EchoControlService(prisma);
  }

  async authenticateX402Request(headers: Record<string, string>): Promise<{
    echoApp: EchoApp | null;
    markUp: MarkUp | null;
  } | null> {
    const requestedAppId = headers['x-echo-app-id'];

    logger.info(`Authenticating X402 request for echo app ${requestedAppId}`);

    if (!requestedAppId) {
      this.echoControlService.identifyX402Request(null, null);
      return null;
    }

    const echoApp = await this.dbService.getEchoAppById(requestedAppId);

    const markUp =
      await this.dbService.getCurrentMarkupByEchoAppId(requestedAppId);

    this.echoControlService.identifyX402Request(echoApp, markUp);

    return { echoApp, markUp };
  }

  async createX402Transaction(
    transaction: Transaction
  ): Promise<TransactionCosts> {
    const applyEchoMarkup = env.APPLY_ECHO_MARKUP === 'true';
    const transactionCosts =
      await this.echoControlService.createX402Transaction(
        transaction,
        applyEchoMarkup
      );

    logger.info(
      `Created X402 transaction for echo app ${transaction.metadata.provider}`
    );

    return transactionCosts;
  }
}
