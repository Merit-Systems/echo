import { EscrowRequest } from 'middleware/transaction-escrow-middleware';
import { X402CreditServiceInput } from 'types';
import { InvalidProxyError, MissingProxyError } from 'errors/http';
import { createPaymentHeader, selectPaymentRequirements } from 'x402/client';
import { toAccount } from 'viem/accounts';
import { x402ResponseSchema } from './facilitator/x402-types';
import { Decimal, InputJsonValue } from 'generated/prisma/runtime/library';
import { EchoDbService } from './DbService';
import { Transaction, UserSpendPoolUsage } from 'generated/prisma';
import logger, { logMetric } from 'logger';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
import { ERC20_CONTRACT_ABI, USDC_ADDRESS } from 'services/fund-repo/constants';
import { EvmServerAccount } from '@coinbase/cdp-sdk';

export class X402CreditRequestService {
  private req: EscrowRequest;
  private headers: Record<string, string>;
  private dbService: EchoDbService;
  private owner: EvmServerAccount;

  constructor({ req, headers, dbService, owner }: X402CreditServiceInput) {
    this.req = req;
    this.headers = headers;
    this.dbService = dbService;
    this.owner = owner;
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

  /**
   * Converts 6-decimal USDC amount to standard decimal representation.
   * USDC uses 6 decimals, so 10000 = 0.01 USD.
   * @param usdcAmount - The amount in 6-decimal USDC format
   * @returns The amount in standard decimal format
   */
  convertUsdcToDecimal(usdcAmount: Decimal): Decimal {
    return usdcAmount.div(1e6);
  }

  async getX402RequestPrice(): Promise<Decimal> {
    const response = await this.makeX402Request();

    if (response.status !== 402) {
      const responseText = await response.text();
      throw new Error(
        `Expected 402 Payment Required response, got ${response.status}. Response: ${responseText.substring(0, 200)}`
      );
    }

    const responseJson = await response.json();
    const x402Response = x402ResponseSchema.safeParse(responseJson);

    if (!x402Response.success) {
      throw new Error(
        `Failed to parse X402 response: ${JSON.stringify(x402Response.error.issues)}`
      );
    }

    return new Decimal(x402Response.data.accepts?.[0]?.maxAmountRequired || 0);
  }

  async makeX402Request(signedPaymentHeader?: string): Promise<Response> {
    const headers = this.getRequestHeaders();
    if (signedPaymentHeader) {
      headers['X-PAYMENT'] = signedPaymentHeader;
    }

    const method = this.getRequestMethod();
    const fetchOptions: RequestInit = {
      method,
      headers,
    };

    if (method !== 'GET' && method !== 'HEAD') {
      const body = this.getRequestBody();
      if (body && Object.keys(body).length > 0) {
        fetchOptions.body = JSON.stringify(body);
      }
    }

    return await fetch(this.getRequestUrl(), fetchOptions);
  }

  async checkOwnerWalletBalance(): Promise<boolean> {
    const publicClient = createPublicClient({
      chain: base,
      transport: http(),
    });

    const usdcBalance = await publicClient.readContract({
      address: USDC_ADDRESS,
      abi: ERC20_CONTRACT_ABI,
      functionName: 'balanceOf',
      args: [this.owner.address],
    });

    const usdcBalanceFormatted = Number(usdcBalance) / 1e6;

    logger.info('USDC Balance on Base for wallet:', {
      address: this.owner.address,
      balance: usdcBalance.toString(),
      rawUnits: usdcBalanceFormatted,
      usdc: usdcBalanceFormatted,
      function: 'getPaymentHeaderFromBody',
    });

    const enoughBalance = usdcBalance > 0;
    const enoughBalanceWithSafetyBuffer = usdcBalanceFormatted > 5;

    if (!enoughBalanceWithSafetyBuffer) {
      logMetric('x402_credit_insufficient_balance_with_safety_buffer', 1, {
        address: this.owner.address,
        balance: usdcBalance.toString(),
        rawUnits: usdcBalanceFormatted,
        usdc: usdcBalanceFormatted,
        function: 'getPaymentHeaderFromBody',
      });
    }

    return enoughBalance;
  }

  async getPaymentHeaderFromBody(): Promise<string> {
    // Get x402 response to extract payment requirements
    const response = await this.makeX402Request();
    if (response.status !== 402) {
      throw new Error(`Expected 402 response, got ${response.status}`);
    }

    const responseJson = await response.json();
    const x402Response = x402ResponseSchema.safeParse(responseJson);

    if (!x402Response.success) {
      throw new Error(
        `Failed to parse X402 response: ${JSON.stringify(x402Response.error.issues)}`
      );
    }

    const ownerAccount = toAccount(this.owner);
    const x402Version = x402Response.data.x402Version;
    const accepts = x402Response.data.accepts;

    if (!accepts || accepts.length === 0) {
      throw new Error('No payment requirements in X402 response');
    }
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
