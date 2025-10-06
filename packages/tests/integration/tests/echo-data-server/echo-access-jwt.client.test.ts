import { describe, test, expect, beforeAll } from 'vitest';
import OpenAI from 'openai';
import {
  TEST_CONFIG,
  echoControlApi,
  TEST_CLIENT_IDS,
} from '../../utils/index.js';
import { EchoControlApiClient } from '../../utils/api-client.js';

describe('Echo Data Server Client Integration Tests', () => {
  beforeAll(async () => {
    console.log('🔧 Starting Echo Data Server client tests...');
    // Ensure echo-control is running and healthy
    await echoControlApi.healthCheck();

    // Ensure echo-data-server is running and healthy
    const response = await fetch(
      `${TEST_CONFIG.services.echoDataServer}/health`
    );
    if (!response.ok) {
      throw new Error('Echo data server health check failed');
    }
  });

  async function getAccessTokenForPaidUser(): Promise<{
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token?: string;
    refresh_token_expires_in?: number;
    scope: string;
  }> {
    // Primary user has payments, so they are the "paid" user
    // Use their primary client that they are a member of
    const { generateCodeVerifier, generateCodeChallenge, generateState } =
      await import('../../utils/auth-helpers.js');

    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);
    const state = generateState();

    console.log(
      `🔑 Getting authorization code for paid user (primary user with primary client)...`
    );

    const redirectUrl = await echoControlApi.validateOAuthAuthorizeRequest({
      client_id: TEST_CLIENT_IDS.primary,
      redirect_uri: 'http://localhost:3000/callback',
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      scope: 'llm:invoke offline_access',
      prompt: 'none', // Skip consent page for automated testing
    });

    // Extract authorization code from callback URL
    const callbackUrl = new URL(redirectUrl);
    const authCode = callbackUrl.searchParams.get('code');
    expect(authCode).toBeTruthy();

    // Exchange authorization code for tokens
    console.log('🔄 Exchanging auth code for access token...');

    const tokenResponse = await echoControlApi.exchangeCodeForToken({
      code: authCode!,
      client_id: TEST_CLIENT_IDS.primary,
      redirect_uri: 'http://localhost:3000/callback',
      code_verifier: codeVerifier,
    });

    expect(tokenResponse.access_token).toBeTruthy();
    console.log('✅ Got valid access token for paid user (primary user)');
    console.log(
      '🔍 Access token (first 50 chars):',
      tokenResponse.access_token!.substring(0, 50) + '...'
    );

    return tokenResponse;
  }

  test('Should create a valid echo access jwt for paid user', async () => {
    const accessToken = await getAccessTokenForPaidUser();
    expect(accessToken).toBeTruthy();
  });

  async function getAccessTokenForUnpaidUser(): Promise<{
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token?: string;
    refresh_token_expires_in?: number;
    scope: string;
  }> {
    const { generateCodeVerifier, generateCodeChallenge, generateState } =
      await import('../../utils/auth-helpers.js');

    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);
    const state = generateState();

    const echoControlApi = new EchoControlApiClient(
      TEST_CONFIG.services.echoControl,
      'test-user-2'
    );

    const redirectUrl = await echoControlApi.validateOAuthAuthorizeRequest({
      client_id: TEST_CLIENT_IDS.secondary,
      redirect_uri: 'http://localhost:3000/callback',
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      scope: 'llm:invoke offline_access',
      prompt: 'none', // Skip consent page for automated testing
    });

    const callbackUrl = new URL(redirectUrl);
    const authCode = callbackUrl.searchParams.get('code');
    expect(authCode).toBeTruthy();

    const tokenResponse = await echoControlApi.exchangeCodeForToken({
      code: authCode!,
      client_id: TEST_CLIENT_IDS.secondary,
      redirect_uri: 'http://localhost:3000/callback',
      code_verifier: codeVerifier,
    });

    expect(tokenResponse.access_token).toBeTruthy();
    console.log('✅ Got valid access token for unpaid user (secondary user)');
    console.log(
      '🔍 Access token (first 50 chars):',
      tokenResponse.access_token!.substring(0, 50) + '...'
    );

    return tokenResponse;
  }

  describe('Unpaid user', () => {
    test('Should be able to generate an access token for an unpaid user', async () => {
      const accessToken = await getAccessTokenForUnpaidUser();
      expect(accessToken).toBeTruthy();
    });
  });

  describe('Non-streaming Chat Completions', () => {
    test('should successfully make a non-streaming chat completion request', async () => {
      // Get a valid access token for the paid user
      let accessToken = await getAccessTokenForPaidUser();

      const balanceCheck = await echoControlApi.getBalance(
        accessToken.access_token
      );
      expect(balanceCheck.totalPaid).toBeGreaterThan(0);

      // Initialize OpenAI client with the valid access token
      const openaiClient = new OpenAI({
        baseURL: TEST_CONFIG.services.echoDataServer,
        apiKey: accessToken.access_token,
      });

      const completion = await openaiClient.chat.completions.create({
        messages: [
          { role: 'user', content: 'Tell me a short story about a cat!' },
        ],
        model: 'gpt-3.5-turbo',
        stream: false,
      });

      expect(completion).toBeDefined();
      expect(completion.choices).toBeDefined();
      expect(completion.choices.length).toBeGreaterThan(0);
      expect(completion.choices[0]).toHaveProperty('message');
      expect(completion.choices[0]?.message).toHaveProperty('content');
      expect(typeof completion.choices[0]?.message?.content).toBe('string');
      expect(completion.choices[0]?.message?.content).toBeTruthy();
      expect(completion.choices[0]?.message?.content!.length).toBeGreaterThan(
        0
      );

      accessToken = await getAccessTokenForPaidUser();

      const secondBalanceCheck = await echoControlApi.getBalance(
        accessToken.access_token
      );
      expect(secondBalanceCheck.totalPaid).toBe(balanceCheck.totalPaid);
      expect(secondBalanceCheck.totalSpent).toBeGreaterThan(
        balanceCheck.totalSpent
      );
      expect(secondBalanceCheck.balance).toBeLessThan(balanceCheck.balance);

      console.log(
        '✅ Paid user (primary user) successfully made LLM request and balance is updated'
      );
    });

    describe('Streaming Chat Completions', () => {
      test('should successfully make a streaming chat completion request', async () => {
        let accessToken = await getAccessTokenForPaidUser();

        const balanceCheck = await echoControlApi.getBalance(
          accessToken.access_token
        );

        accessToken = await getAccessTokenForPaidUser();

        const openaiClient = new OpenAI({
          baseURL: TEST_CONFIG.services.echoDataServer,
          apiKey: accessToken.access_token,
        });

        const stream = await openaiClient.chat.completions.create({
          messages: [
            { role: 'user', content: 'Tell me a short story about a cat!' },
          ],
          model: 'gpt-3.5-turbo',
          stream: true,
        });

        expect(stream).toBeDefined();

        let receivedContent = '';
        let chunkCount = 0;

        for await (const chunk of stream) {
          chunkCount++;
          expect(chunk).toBeDefined();
          expect(chunk.choices).toBeDefined();
          const content = chunk.choices[0]?.delta?.content || '';
          receivedContent += content;
        }

        expect(chunkCount).toBeGreaterThan(0);
        expect(receivedContent.length).toBeGreaterThan(0);

        accessToken = await getAccessTokenForPaidUser();

        const secondBalanceCheck = await echoControlApi.getBalance(
          accessToken.access_token
        );
        expect(secondBalanceCheck.totalPaid).toBe(balanceCheck.totalPaid);
        expect(secondBalanceCheck.totalSpent).toBeGreaterThan(
          balanceCheck.totalSpent
        );
        expect(secondBalanceCheck.balance).toBeLessThan(balanceCheck.balance);

        console.log(
          '✅ Paid user (primary user) successfully made streaming LLM request and balance is updated'
        );
      });
    });
  });

  // TODO Tests:

  // Can I spend on a different app? - NO

  // User that hasn't paid -- should get 402

  // User that isn't authenticated -- should get 401

  test("User that isn't authenticated -- should get 401", async () => {
    const nonsenseAccessToken = 'nonsense';

    const openaiClient = new OpenAI({
      baseURL: TEST_CONFIG.services.echoDataServer,
      apiKey: nonsenseAccessToken,
    });

    const completion = await openaiClient.chat.completions
      .create({
        messages: [
          { role: 'user', content: 'Tell me a short story about a cat!' },
        ],
        model: 'gpt-3.5-turbo',
        stream: false,
      })
      .catch(error => {
        expect(error.status).toBe(401);
      });

    expect(completion).toBeUndefined();
  });

  test(
    'User with expired access token -- should get 401',
    async () => {
      const accessToken = await getAccessTokenForPaidUser();
      expect(accessToken).toBeTruthy();

      const balanceCheck = await echoControlApi.getBalance(
        accessToken.access_token
      );
      expect(balanceCheck).toBeDefined();

      console.log('✅ Access token successfully used to get balance');

      console.log(
        `🔍 Access token expires in ${accessToken.expires_in} seconds`
      );

      // Wait for the access token to expire
      // Note: jwtVerify has a 5-second clock tolerance, so we need to wait for expiry + tolerance + buffer
      const clockTolerance = 5000; // 5 seconds
      const buffer = 1000; // 1 second buffer
      const waitTime = accessToken.expires_in * 1000 + clockTolerance + buffer;
      console.log(
        `⏳ Waiting ${waitTime}ms for access token to expire (includes 5s clock tolerance)...`
      );
      await new Promise(resolve => setTimeout(resolve, waitTime));

      const openaiClient = new OpenAI({
        baseURL: TEST_CONFIG.services.echoDataServer,
        apiKey: accessToken.access_token,
      });

      const completion = await openaiClient.chat.completions
        .create({
          messages: [
            { role: 'user', content: 'Tell me a short story about a cat!' },
          ],
          model: 'gpt-3.5-turbo',
          stream: false,
        })
        .catch(error => {
          expect(error.status).toBe(401);
        });

      expect(completion).toBeUndefined();

      console.log('✅ Access token expired and was rejected');
    },
    40000 // 40 second timeout (needs to wait ~21 seconds for token to expire)
  );

  test("User that hasn't paid -- should get 402", async () => {
    const accessToken = await getAccessTokenForUnpaidUser();
    expect(accessToken).toBeTruthy();

    const balanceCheck = await echoControlApi.getBalance(
      accessToken.access_token
    );
    expect(balanceCheck).toBeDefined();
    expect(balanceCheck.totalPaid).toBe(0);

    const openaiClient = new OpenAI({
      baseURL: TEST_CONFIG.services.echoDataServer,
      apiKey: accessToken.access_token,
    });

    const completion = await openaiClient.chat.completions
      .create({
        messages: [
          { role: 'user', content: 'Tell me a short story about a cat!' },
        ],
        model: 'gpt-3.5-turbo',
        stream: false,
      })
      .catch(error => {
        expect(error.status).toBe(402);
      });

    expect(completion).toBeUndefined();

    console.log(
      '✅ Unpaid user (secondary user) successfully made LLM request and was rejected due to insufficient balance'
    );
  });
});
