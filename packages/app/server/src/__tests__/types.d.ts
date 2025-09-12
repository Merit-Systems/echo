/// <reference types="vitest/globals" />

import type { MockedFunction } from 'vitest';

declare module 'supertest' {
  import { SuperTest, Test } from 'supertest';
  export default function supertest(app: any): SuperTest<Test>;
}

// Mock types for testing
export interface MockEchoControlService {
  verifyApiKey: MockedFunction<any>;
  getBalance: MockedFunction<any>;
  createTransaction: MockedFunction<any>;
  getUserId: MockedFunction<any>;
  getEchoAppId: MockedFunction<any>;
  getUser: MockedFunction<any>;
  getEchoApp: MockedFunction<any>;
  getAuthResult: MockedFunction<any>;
}

export interface MockAuthenticationResult {
  userId: string;
  echoAppId: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
  echoApp: {
    id: string;
    name: string;
    userId: string;
  };
}
