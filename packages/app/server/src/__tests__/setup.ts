import dotenv from 'dotenv';
import { vi } from 'vitest';
import { ok } from 'neverthrow';

// Load environment variables from .env.test if it exists, otherwise from .env
dotenv.config({ path: '.env.test' });

// Mock the EchoControlService
vi.mock('../services/EchoControlService', () => {
  return {
    EchoControlService: vi.fn().mockImplementation(() => ({
      verifyApiKey: vi.fn(),
      getBalance: vi.fn().mockResolvedValue(ok(100)),
      createTransaction: vi.fn().mockResolvedValue(ok(undefined)),
      computeTransactionCosts: vi.fn().mockResolvedValue(ok({
        rawTransactionCost: 0.01,
        totalTransactionCost: 0.01,
        totalAppProfit: 0,
        referralProfit: 0,
        markUpProfit: 0,
        echoProfit: 0,
      })),
      getOrNoneFreeTierSpendPool: vi.fn().mockResolvedValue(ok(null)),
      getUserId: vi.fn(),
      getEchoAppId: vi.fn(),
      getUser: vi.fn(),
      getEchoApp: vi.fn(),
      getAuthResult: vi.fn(),
    })),
  };
});

// Mock fetch globally (for both outbound API calls and echo-control calls)
global.fetch = vi.fn();
