import { EscrowRequest } from 'middleware/transaction-escrow-middleware';
import { EchoControlService } from 'services/EchoControlService';
import { X402CreditHandlerInput } from 'types';
import { Response as ExpressResponse } from 'express';
import { InvalidProxyError, MissingProxyError } from 'errors/http';
import { createPaymentHeader, selectPaymentRequirements } from 'x402';
import { toAccount } from 'viem/accounts';
import { getSmartAccount } from 'utils';
import { x402ResponseSchema } from './facilitator/x402-types';
import { Decimal, InputJsonValue } from 'generated/prisma/runtime/library';
import { EchoDbService } from './DbService';
import { Transaction, UserSpendPoolUsage } from 'generated/prisma';

export class X402CreditRequestService {
  private req: EscrowRequest;
  private res: ExpressResponse;
  private headers: Record<string, string>;
  private echoControlService: EchoControlService;
  private dbService: EchoDbService;

  constructor({
    req,
    res,
    headers,
    echoControlService,
    dbService,
  }: X402CreditHandlerInput) {
    this.req = req;
    this.res = res;
    this.headers = headers;
    this.echoControlService = echoControlService;
    this.dbService = dbService;
  }

  getRequestUrl(): URL {
    if (!this.req.query.proxy) {
      throw new MissingProxyError();
    }
    try {
      return new URL(this.req.query.proxy as string);
    } catch (error) {
      throw new InvalidProxyError();
    }
  }

  getRequestMethod(): string {
    return this.req.method;
  }

  getRequestHeaders(): Record<string, string> {
    return this.headers;
  }

  getRequestBody(): any {
    return this.req.body;
  }

  async getX402RequestPrice(): Promise<Decimal> {
    const response = await this.makeX402Request();
    const x402Response = x402ResponseSchema.safeParse(await response.json());
    if (!x402Response.success) {
      throw new Error('Failed to parse X402 response');
    }
    return new Decimal(x402Response.data.accepts?.[0]?.maxAmountRequired || 0);
  }

  async makeX402Request(signedPaymentHeader?: string): Promise<Response> {
    const headers = this.getRequestHeaders();
    if (signedPaymentHeader) {
      headers['x-payment'] = signedPaymentHeader;
    }
    return await fetch(this.getRequestUrl(), {
      method: this.getRequestMethod(),
      headers: this.getRequestHeaders(),
      body: this.getRequestBody(),
    });
  }

  async getPaymentHeaderFromBody(): Promise<string> {
    const body = this.getRequestBody();
    const { owner } = await getSmartAccount();
    const ownerAccount = toAccount(owner);
    const x402Version = body.x402Version;
    const accepts = body.accepts;
    const selectedPaymentRequirements = selectPaymentRequirements(accepts);
    const paymentHeader = await createPaymentHeader(
      ownerAccount,
      x402Version,
      selectedPaymentRequirements
    );
    return paymentHeader;
  }

  async upsertTransactionArgsAfterResponse(
    metadataId: string,
    resourceResponse: InputJsonValue | null,
    resourceError: InputJsonValue | null
  ): Promise<void> {
    await this.dbService.upsertX402TransactionMetadata(
      metadataId,
      resourceResponse,
      resourceError
    );
  }

  private extractTransactionRecord(
    createdTransaction:
      | Transaction
      | { transaction: Transaction; userSpendPoolUsage: UserSpendPoolUsage }
  ): Transaction {
    return 'transaction' in createdTransaction
      ? createdTransaction.transaction
      : createdTransaction;
  }

  async executeX402RequestAndUpdateMetadata(
    createdTransaction:
      | Transaction
      | { transaction: Transaction; userSpendPoolUsage: UserSpendPoolUsage }
      | null
  ): Promise<Response> {
    if (!createdTransaction) {
      throw new Error('Failed to create transaction');
    }

    const transactionRecord = this.extractTransactionRecord(createdTransaction);

    if (!transactionRecord.x402TransactionMetadataId) {
      throw new Error('Missing x402TransactionMetadataId');
    }

    const paymentHeader = await this.getPaymentHeaderFromBody();
    const response = await this.makeX402Request(paymentHeader);

    const responseClone = response.clone();
    try {
      const responseData = await response.json();
      await this.upsertTransactionArgsAfterResponse(
        transactionRecord.x402TransactionMetadataId,
        responseData,
        null
      );
    } catch (error) {
      const errorObj = {
        error: 'Failed to parse response JSON',
        message: error instanceof Error ? error.message : String(error),
        statusCode: response.status,
        statusText: response.statusText,
      };
      await this.upsertTransactionArgsAfterResponse(
        transactionRecord.x402TransactionMetadataId,
        null,
        errorObj
      );
    }
    return responseClone;
  }
}
