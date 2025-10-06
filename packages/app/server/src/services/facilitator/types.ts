export enum Network {
  BASE = 'base',
  BASE_SEPOLIA = 'base-sepolia',
}

export interface X402ChallengeParams {
  realm: string;
  link: string;
  network: Network;
}

export interface X402PaymentBody {
  type: 'x402';
  amount: string;
  url: string;
  network: Network;
  to: Address;
}

export enum X402Version {
  V1 = 'V1',
}

export enum Schema {
  Exact = 'Exact',
}

export type Address = string;
export type TokenAmount = string;
export type Url = string;
export type Nonce = string;

export interface ExactEvmPayloadAuthorization {
  from: Address;
  to: Address;
  value: TokenAmount;
  valid_after: string;
  valid_before: string;
  nonce: Nonce;
}

export interface ExactEvmPayload {
  signature: string;
  authorization: ExactEvmPayloadAuthorization;
}

export interface PaymentPayload {
  x402_version: X402Version;
  schema: Schema;
  network: Network;
  payload: ExactEvmPayload;
}

export interface PaymentRequirements {
  schema: Schema;
  network: Network;
  max_amount_required: TokenAmount;
  resource: Url;
  description: string;
  mime_type: string;
  output_schema?: unknown;
  pay_to: Address;
  max_timeout_seconds: number;
  asset: Address;
  extra?: unknown;
}

export interface VerifyResponse {
  isValid: boolean;
  transaction_id?: string;
  payer?: string;
}

export interface VerifyRequest {
  x402_version: X402Version;
  payment_payload: PaymentPayload;
  payment_requirements: PaymentRequirements;
}

export type SettleRequest = VerifyRequest;

export type SettleResponse = {
  transaction_id?: string;
  transaction?: string;
};

export interface PaymentRequiredResponse {
  error: string;
  accepts: PaymentRequirements[];
  x402_version: X402Version;
}

export interface SupportedPaymentKind {
  x402_version: X402Version;
  schema: Schema;
  network: Network;
  extra?: { fee_payer: Address };
}

export interface SupportedPaymentKindsResponse {
  kinds: SupportedPaymentKind[];
}

export type TransferWithAuthorization = Omit<
  ExactEvmPayloadAuthorization,
  'from'
>;
