import {
  GetBalanceResponse,
  GetUserResponse,
  GetBalanceByIdFreeResponse,
} from '@merit-systems/echo-typescript-sdk';

import { EchoConfig } from '@merit-systems/echo-typescript-sdk';

export interface EchoAuthConfig extends EchoConfig {
  redirectUri?: string;
  scope?: string;
}

export type BalanceData = {
  balance: EchoBalance | null;
  freeTierBalance: GetBalanceByIdFreeResponse | null;
};

export type EchoUser = GetUserResponse;

export type EchoBalance = GetBalanceResponse;

export interface EchoSignInProps {
  onSuccess?: (user: EchoUser) => void;
  onError?: (error: Error) => void;
  className?: string;
  children?: React.ReactNode;
}

export interface EchoSignOutProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  className?: string;
  children?: React.ReactNode;
}

export interface EchoTokensProps {
  amount?: number;
  onPurchaseComplete?: (balance: EchoBalance) => void;
  onError?: (error: Error) => void;
  className?: string;
  children?: React.ReactNode;
  showAvatar?: boolean;
}
