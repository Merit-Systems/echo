import { server } from '../mocks/server';
import { errorHandlers } from '../mocks/handlers';
import { createTamperedJWT } from '../mocks/jwt-factory';

describe('JWT Security - Token Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    server.resetHandlers();
  });

  describe('JWT API Rejection', () => {
    test('API rejects tampered JWT tokens', async () => {
      const tamperedToken = await createTamperedJWT();
      server.use(errorHandlers.tamperedToken);

      const response = await fetch('http://localhost:3000/api/balance', {
        headers: {
          Authorization: `Bearer ${tamperedToken}`,
        },
      });

      expect(response.status).toBe(401);
      const error = await response.json();
      expect(error.error).toBe('invalid_token');
    });

    test('API rejects expired tokens', async () => {
      server.use(errorHandlers.expiredToken);

      const response = await fetch('http://localhost:3000/api/balance', {
        headers: {
          Authorization: 'Bearer expired-token',
        },
      });

      expect(response.status).toBe(401);
    });
  });
});
