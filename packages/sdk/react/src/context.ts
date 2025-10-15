import type {
  EchoClient,
  EchoConfig,
  GetBalanceByIdFreeResponse,
} from '@merit-systems/echo-typescript-sdk';
import { User } from 'oidc-client-ts';
import { BalanceData, EchoBalance, EchoUser } from './types';
import { createContext } from 'react';

export interface EchoContextValue {
  // Auth & User
  rawUser: User | null | undefined; // directly piped from oidc -- TODO: rm when EchoUser is sufficient.
  isLoggedIn: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  getToken: () => Promise<string | null>; // null in proxy mode
  echoClient: EchoClient | null;
  config: EchoConfig;

  isLoading: boolean;
  error: string | null;

  user: EchoUser | null; // directly piped from oidc

  freeTierBalance: GetBalanceByIdFreeResponse | null;
  balance: EchoBalance | null;
  refreshBalance: () => Promise<BalanceData | undefined>;

  createPaymentLink: (
    amount: number,
    description?: string,
    successUrl?: string
  ) => Promise<string>;

  // Insufficient funds state
  isInsufficientFunds: boolean;
  setIsInsufficientFunds: (value: boolean) => void;
}

export const EchoContext = createContext<EchoContextValue | null>(null);
