import { describe, test, expect, beforeAll } from 'vitest';
import OpenAI from 'openai';
import {
  TEST_CONFIG,
  echoControlApi,
  TEST_CLIENT_IDS,
} from '../../utils/index.js';
import { EchoControlApiClient } from '../../utils/api-client.js';

describe('Echo Data Server Free Tier Integration Tests', () => {
  beforeAll(async () => {
    console.log('🔧 Starting Echo Data Server free tier tests...');
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

  async function getAccessTokenForFreeTierUser(): Promise<{
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token?: string;
    refresh_token_expires_in?: number;
    scope: string;
  }> {
    // Tertiary user will be our free tier user (no payments, uses spend pool)
    const { generateCodeVerifier, generateCodeChallenge, generateState } =
      await import('../../utils/auth-helpers.js');

    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);
    const state = generateState();

    console.log(
      `🔑 Getting authorization code for free tier user (tertiary user with tertiary client)...`
    );

    const echoControlApi = new EchoControlApiClient(
      TEST_CONFIG.services.echoControl,
      'test-user-3'
    );

    const redirectUrl = await echoControlApi.validateOAuthAuthorizeRequest({
      client_id: TEST_CLIENT_IDS.tertiary,
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
      client_id: TEST_CLIENT_IDS.tertiary,
      redirect_uri: 'http://localhost:3000/callback',
      code_verifier: codeVerifier,
    });

    expect(tokenResponse.access_token).toBeTruthy();
    console.log('✅ Got valid access token for free tier user (tertiary user)');
    console.log(
      '🔍 Access token (first 50 chars):',
      tokenResponse.access_token!.substring(0, 50) + '...'
    );

    return tokenResponse;
  }

  test('Should create a valid echo access jwt for free tier user', async () => {
    const accessToken = await getAccessTokenForFreeTierUser();
    expect(accessToken).toBeTruthy();
  });

  describe('Free Tier Chat Completions', () => {
    test('should successfully make a free tier chat completion request', async () => {
      // Get a valid access token for the free tier user
      let accessToken = await getAccessTokenForFreeTierUser();

      const regularBalanceCheck = await echoControlApi.getBalance(
        accessToken.access_token
      );
      expect(regularBalanceCheck.totalPaid).toBe(0);

      console.log('💰 Regular balance check:', regularBalanceCheck);

      const balanceCheck = await echoControlApi.getFreeTierBalance(
        accessToken.access_token,
        TEST_CLIENT_IDS.tertiary
      );

      // Initialize OpenAI client with the valid access token
      const openaiClient = new OpenAI({
        baseURL: TEST_CONFIG.services.echoDataServer,
        apiKey: accessToken.access_token,
      });

      const completion = await openaiClient.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: 'Tell me a very short joke about programming!',
          },
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

      // Check that spend pool usage was updated
      accessToken = await getAccessTokenForFreeTierUser();

      const secondBalanceCheck = await echoControlApi.getFreeTierBalance(
        accessToken.access_token,
        TEST_CLIENT_IDS.tertiary
      );
      // User's personal balance should remain 0 (no payments)
      expect(secondBalanceCheck.spendPoolBalance).toBeLessThan(
        balanceCheck.spendPoolBalance
      );
      expect(secondBalanceCheck.userSpendInfo.amountSpent).toBeGreaterThan(
        balanceCheck.userSpendInfo.amountSpent
      );

      console.log('💰 Second Free Tier Balance check:', secondBalanceCheck);

      console.log(
        '✅ Free tier user (tertiary user) successfully made LLM request using spend pool'
      );
    });

    test('should exhaust spend pool and get 402 payment required error', async () => {
      // Get a valid access token for the free tier user
      let accessToken = await getAccessTokenForFreeTierUser();

      // Initialize OpenAI client with the valid access token
      let openaiClient = new OpenAI({
        baseURL: TEST_CONFIG.services.echoDataServer,
        apiKey: accessToken.access_token,
      });

      // Keep making requests until we exhaust the spend pool
      let requestCount = 0;
      const maxRequests = 50; // Safety limit to prevent infinite loop

      console.log('🔄 Making requests to exhaust spend pool...');

      while (requestCount < maxRequests) {
        try {
          // Check balance before request
          accessToken = await getAccessTokenForFreeTierUser();
          const balanceCheck = await echoControlApi.getFreeTierBalance(
            accessToken.access_token,
            TEST_CLIENT_IDS.tertiary
          );

          console.log(
            `💰 Request ${requestCount + 1} - Spend pool balance: ${balanceCheck.spendPoolBalance}, User spent: ${balanceCheck.userSpendInfo.amountSpent}`
          );

          // If user has already spent their limit, break
          if (
            balanceCheck.userSpendInfo.spendLimit &&
            balanceCheck.userSpendInfo.amountSpent >=
              balanceCheck.userSpendInfo.spendLimit
          ) {
            console.log('💸 User has reached their spend limit');
            break;
          }
          accessToken = await getAccessTokenForFreeTierUser();
          openaiClient = new OpenAI({
            baseURL: TEST_CONFIG.services.echoDataServer,
            apiKey: accessToken.access_token,
          });

          const completion = await openaiClient.chat.completions.create({
            messages: [
              { role: 'user', content: `Say "Hello ${requestCount + 1}"` },
            ],
            model: 'gpt-3.5-turbo',
            stream: false,
          });

          expect(completion).toBeDefined();
          expect(completion.choices[0]?.message?.content).toBeTruthy();

          requestCount++;
          console.log(`✅ Request ${requestCount} successful`);
        } catch (error: any) {
          console.log(
            `❌ Request ${requestCount + 1} failed with error:`,
            error.status
          );
          if (error.status === 402) {
            console.log('🎯 Got 402 Payment Required as expected!');
            break;
          }
          throw error; // Re-throw if it's not the expected 402 error
        }
      }

      expect(requestCount).toBeGreaterThan(0);
      console.log(
        `📊 Made ${requestCount} successful requests before hitting limit`
      );

      // Now verify that the next request gets a 402 error
      console.log('🧪 Testing that next request gets 402 error...');

      accessToken = await getAccessTokenForFreeTierUser();

      const completion = await openaiClient.chat.completions
        .create({
          messages: [
            {
              role: 'user',
              content: 'This should fail due to spend pool exhaustion',
            },
          ],
          model: 'gpt-3.5-turbo',
          stream: false,
        })
        .catch(error => {
          expect(error.status).toBe(402);
          console.log('✅ Got expected 402 Payment Required error');
          return undefined;
        });

      expect(completion).toBeUndefined();

      // Verify final balance state
      accessToken = await getAccessTokenForFreeTierUser();
      const finalBalanceCheck = await echoControlApi.getFreeTierBalance(
        accessToken.access_token,
        TEST_CLIENT_IDS.tertiary
      );

      console.log('💰 Final balance check:', finalBalanceCheck);
      expect(finalBalanceCheck.userSpendInfo.spendLimit).toBeTruthy();
      expect(
        finalBalanceCheck.userSpendInfo.amountSpent
      ).toBeGreaterThanOrEqual(finalBalanceCheck.userSpendInfo.spendLimit!);

      console.log(
        '✅ Free tier user (tertiary user) successfully exhausted spend pool and received 402 error'
      );
    });
  });
});
