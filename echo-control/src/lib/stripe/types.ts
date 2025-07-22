// Types for Stripe feature

import { Payment } from '@/generated/prisma';

export interface CreatePaymentLinkRequest {
  amount: number;
  description?: string;
  successUrl?: string;
}

export interface CreatePaymentLinkResult {
  paymentLink: {
    id: string;
    url: string;
    amount: number;
    currency: string;
    status: string;
    created: number;
    metadata: {
      userId: string;
      description: string;
    };
  };
  payment: Payment; // Payment record from database
}
