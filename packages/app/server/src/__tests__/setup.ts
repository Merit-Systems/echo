import dotenv from 'dotenv';
import { vi } from 'vitest';

// Load environment variables from .env.test if it exists, otherwise from .env
dotenv.config({ path: '.env.test' });

// Mock the environment variables
process.env.NETWORK = 'base-sepolia';
process.env.ECHO_ROUTER_BASE_URL = 'http://localhost:3000';

// Mock the EchoControlService
vi.mock('../services/EchoControlService', () => {
  return {
    EchoControlService: vi.fn().mockImplementation(() => ({
      verifyApiKey: vi.fn(),
      getBalance: vi.fn(),
      createTransaction: vi.fn().mockResolvedValue(undefined),
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
