import { describe, test, expect, beforeAll } from 'vitest';
import { TEST_CONFIG, TEST_DATA, TEST_CLIENT_IDS } from '@/config/index';
import { echoControlApi, EchoControlApiClient } from '@/utils/api-client';
import {
  generateCodeVerifier,
  generateCodeChallenge,
  generateState,
} from '@/utils/auth-helpers';

describe('Referral Code Client', () => {
  let primaryUserAccessToken: string;
  let secondaryUserAccessToken: string;
  let tertiaryUserAccessToken: string;
  const testAppId = TEST_CLIENT_IDS.primary;

  beforeAll(async () => {
    // Get access tokens via OAuth for all three test users
    // Primary user (has a referral code in seed data)
    const codeVerifier1 = generateCodeVerifier();
    const codeChallenge1 = generateCodeChallenge(codeVerifier1);
    const state1 = generateState();

    const primaryAuthUrl = await echoControlApi.validateOAuthAuthorizeRequest({
      client_id: testAppId,
      redirect_uri: 'http://localhost:3000/callback',
      state: state1,
      code_challenge: codeChallenge1,
      code_challenge_method: 'S256',
      scope: 'llm:invoke offline_access',
      prompt: 'none',
    });

    const primaryCallbackUrl = new URL(primaryAuthUrl);
    const primaryAuthCode = primaryCallbackUrl.searchParams.get('code');
    expect(primaryAuthCode).toBeTruthy();

    const primaryTokens = await echoControlApi.exchangeCodeForToken({
      code: primaryAuthCode!,
      client_id: testAppId,
      redirect_uri: 'http://localhost:3000/callback',
      code_verifier: codeVerifier1,
    });
    primaryUserAccessToken = primaryTokens.access_token;

    // Secondary user (also has a referral code in seed data)
    const api2 = new EchoControlApiClient(
      TEST_CONFIG.services.echoControl,
      'test-user-2'
    );
    const codeVerifier2 = generateCodeVerifier();
    const codeChallenge2 = generateCodeChallenge(codeVerifier2);
    const state2 = generateState();

    const secondaryAuthUrl = await api2.validateOAuthAuthorizeRequest({
      client_id: testAppId,
      redirect_uri: 'http://localhost:3000/callback',
      state: state2,
      code_challenge: codeChallenge2,
      code_challenge_method: 'S256',
      scope: 'llm:invoke offline_access',
      prompt: 'none',
    });

    const secondaryCallbackUrl = new URL(secondaryAuthUrl);
    const secondaryAuthCode = secondaryCallbackUrl.searchParams.get('code');
    expect(secondaryAuthCode).toBeTruthy();

    const secondaryTokens = await echoControlApi.exchangeCodeForToken({
      code: secondaryAuthCode!,
      client_id: testAppId,
      redirect_uri: 'http://localhost:3000/callback',
      code_verifier: codeVerifier2,
    });
    secondaryUserAccessToken = secondaryTokens.access_token;

    // Tertiary user (does not have a referral code yet)
    const api3 = new EchoControlApiClient(
      TEST_CONFIG.services.echoControl,
      'test-user-3'
    );
    const codeVerifier3 = generateCodeVerifier();
    const codeChallenge3 = generateCodeChallenge(codeVerifier3);
    const state3 = generateState();

    const tertiaryAuthUrl = await api3.validateOAuthAuthorizeRequest({
      client_id: testAppId,
      redirect_uri: 'http://localhost:3000/callback',
      state: state3,
      code_challenge: codeChallenge3,
      code_challenge_method: 'S256',
      scope: 'llm:invoke offline_access',
      prompt: 'none',
    });

    const tertiaryCallbackUrl = new URL(tertiaryAuthUrl);
    const tertiaryAuthCode = tertiaryCallbackUrl.searchParams.get('code');
    expect(tertiaryAuthCode).toBeTruthy();

    const tertiaryTokens = await echoControlApi.exchangeCodeForToken({
      code: tertiaryAuthCode!,
      client_id: testAppId,
      redirect_uri: 'http://localhost:3000/callback',
      code_verifier: codeVerifier3,
    });
    tertiaryUserAccessToken = tertiaryTokens.access_token;
  });

  test('should retrieve existing referral code for primary user', async () => {
    const result = await echoControlApi.getUserReferralCode(
      primaryUserAccessToken,
      testAppId
    );

    expect(result.success).toBe(true);
    expect(result.code).toBeDefined();
    expect(result.code).toBe(TEST_DATA.referralCodes.primaryUserCode.code);
    expect(result.referralLinkUrl).toBeDefined();
    expect(result.referralLinkUrl).toContain(result.code);
    expect(result.expiresAt).toBeDefined();

    console.log('✅ Primary user successfully retrieved their referral code');
  });

  test('should create referral code for tertiary user who does not have one', async () => {
    const result = await echoControlApi.getUserReferralCode(
      tertiaryUserAccessToken,
      testAppId
    );

    expect(result.success).toBe(true);
    expect(result.code).toBeDefined();
    expect(result.referralLinkUrl).toBeDefined();
    expect(result.referralLinkUrl).toContain(result.code);
    expect(result.expiresAt).toBeDefined();

    console.log(
      '✅ Tertiary user successfully created a new referral code',
      result.code
    );
  });

  test('should apply referral code from primary user to secondary user membership', async () => {
    const primaryReferralCode = await echoControlApi.getUserReferralCode(
      primaryUserAccessToken,
      testAppId
    );

    expect(primaryReferralCode.code).toBeDefined();

    // Secondary user applies the primary user's referral code
    const result = await echoControlApi.applyReferralCode(
      secondaryUserAccessToken,
      testAppId,
      primaryReferralCode.code!
    );

    expect(result.success).toBe(true);
    expect(result.message).toContain('successfully');

    console.log(
      '✅ Secondary user successfully applied primary user referral code'
    );
  });

  test('should reject applying referral code when user already has a referrer', async () => {
    const tertiaryReferralCode = await echoControlApi.getUserReferralCode(
      tertiaryUserAccessToken,
      testAppId
    );

    expect(tertiaryReferralCode.code).toBeDefined();

    // Secondary user already has a referrer from previous test
    // Attempt to apply tertiary user's code should fail
    await expect(
      echoControlApi.applyReferralCode(
        secondaryUserAccessToken,
        testAppId,
        tertiaryReferralCode.code!
      )
    ).rejects.toThrow();

    console.log(
      '✅ System correctly rejected referral code application for user who already has a referrer'
    );
  });

  test('should reject invalid referral code', async () => {
    const invalidCode = 'INVALID-REFERRAL-CODE-12345';

    await expect(
      echoControlApi.applyReferralCode(
        tertiaryUserAccessToken,
        testAppId,
        invalidCode
      )
    ).rejects.toThrow();

    console.log('✅ System correctly rejected invalid referral code');
  });

  test('should get same referral code on multiple requests', async () => {
    const firstResult = await echoControlApi.getUserReferralCode(
      primaryUserAccessToken,
      testAppId
    );

    const secondResult = await echoControlApi.getUserReferralCode(
      primaryUserAccessToken,
      testAppId
    );

    expect(firstResult.code).toBe(secondResult.code);
    expect(firstResult.referralLinkUrl).toBe(secondResult.referralLinkUrl);

    console.log('✅ Referral code is consistent across multiple requests');
  });
});

