import {
  EchoAnthropicProvider,
  EchoGoogleProvider,
  EchoOpenAIProvider,
  User,
} from '@merit-systems/echo-typescript-sdk';
import { NextRequest } from 'next/server';

export interface EchoConfig {
  /**
   *  Echo App ID.
   */
  appId: string;
  /**
   *  Base path of API URL.
   *  @default /api/echo
   */
  basePath?: string;
  /** @internal */
  baseRouterUrl?: string;
  /** @internal */
  baseEchoUrl?: string;
}

// We went pretty ham here just so that we can generically construct the provider
export type AsyncProvider<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer R
    ? (...args: A) => Promise<R>
    : T[K];
} & (T extends (...args: infer A) => infer R ? (...args: A) => Promise<R> : {});

export type AppRouteHandlers = Record<
  'GET' | 'POST',
  (req: NextRequest) => Promise<Response>
>;

export type EchoResult = {
  handlers: AppRouteHandlers;

  getUser: () => Promise<User | null>;
  isSignedIn: () => Promise<boolean>;

  openai: EchoOpenAIProvider;
  anthropic: EchoAnthropicProvider;
  google: EchoGoogleProvider;
};
