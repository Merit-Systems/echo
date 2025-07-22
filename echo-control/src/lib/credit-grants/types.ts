// Types for Credit Grants feature

import { CreditGrantType, CreditGrantSource } from '../shared/enums';

export interface CreateCreditGrantRequest {
  type: CreditGrantType;
  amount: number; // Amount in dollars (will be stored with pico-cent precision)
  source: CreditGrantSource;
  description?: string;
  expiresAt?: Date; // Optional expiration date for credits
  paymentId?: string; // Link to payment if created from payment
  transactionId?: string; // Link to transaction if created from transaction debit
}

export interface CreditGrantFilters {
  type?: CreditGrantType;
  source?: CreditGrantSource;
  isExpired?: boolean;
  paymentId?: string;
  transactionId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}
