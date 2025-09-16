import '@testing-library/jest-dom';
import { beforeAll, afterEach, afterAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from './mocks/server';

// Setup MSW server
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' });
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

// Ensure global is available (Node.js compatibility)
if (typeof global === 'undefined') {
  (globalThis as { global?: typeof globalThis }).global = globalThis;
}

// Mock window.crypto for PKCE testing
Object.defineProperty(window, 'crypto', {
  value: {
    subtle: {
      digest: vi.fn().mockResolvedValue(new ArrayBuffer(32)),
    },
    randomUUID: vi.fn(() => 'mock-uuid-1234'),
    getRandomValues: vi.fn(array => {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    }),
  },
});

// Mock window.location for OAuth redirects
Object.defineProperty(window, 'location', {
  value: {
    origin: 'http://localhost:3000',
    pathname: '/',
    search: '',
    href: 'http://localhost:3000/',
    assign: vi.fn(),
    replace: vi.fn(),
  },
  writable: true,
});

// Mock history API
Object.defineProperty(window, 'history', {
  value: {
    replaceState: vi.fn(),
    pushState: vi.fn(),
  },
});

// Mock window.confirm for payment flow tests
Object.defineProperty(window, 'confirm', {
  value: vi.fn(() => true), // Default to true for tests
  writable: true,
});

// Mock window.open for payment flow tests
Object.defineProperty(window, 'open', {
  value: vi.fn(() => null), // Default to null (popup blocked)
  writable: true,
});

// Polyfill for URL constructor if not available
if (typeof URL === 'undefined') {
  class URLPolyfill {
    href: string = '';
    searchParams: URLSearchParams = new URLSearchParams();

    constructor(url: string, base?: string) {
      // Simple URL implementation for testing
      this.href = base ? new URLPolyfill(url, base).href : url;
    }
  }

  (globalThis as { URL?: typeof URLPolyfill }).URL = URLPolyfill;
}

// Polyfill for URLSearchParams if not available
if (typeof URLSearchParams === 'undefined') {
  class URLSearchParamsPolyfill {
    private params = new Map<string, string>();

    constructor(init?: string | Record<string, string>) {
      if (typeof init === 'string') {
        // Parse query string
        init.split('&').forEach(pair => {
          const [key, value] = pair.split('=').map(decodeURIComponent);
          if (key) this.params.set(key, value || '');
        });
      } else if (init) {
        Object.entries(init).forEach(([key, value]) => {
          this.params.set(key, value);
        });
      }
    }

    set(name: string, value: string) {
      this.params.set(name, value);
    }

    get(name: string) {
      return this.params.get(name);
    }

    toString() {
      return Array.from(this.params.entries())
        .map(
          ([key, value]) =>
            `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
        )
        .join('&');
    }
  }

  (
    globalThis as { URLSearchParams?: typeof URLSearchParamsPolyfill }
  ).URLSearchParams = URLSearchParamsPolyfill;
}
