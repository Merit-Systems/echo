import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/**
 * MSW server for intercepting HTTP requests in tests
 */
export const server = setupServer(...handlers);
