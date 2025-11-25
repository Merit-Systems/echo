import { describe, test, expect, beforeAll } from 'vitest';
import { TEST_CONFIG, TEST_DATA, TEST_CLIENT_IDS } from '@/config/index';
import { echoControlApi } from '@/utils/api-client';
import {
  startOAuthFlow,
  extractAuthorizationCodeFromUrl,
  completeOAuthFlow,
} from '@/utils/auth-helpers';

describe('Referral Code Client', () => {
  let primaryUserAccessToken: string;
  let secondaryUserAccessToken: string;
  let tertiaryUserAccessToken: string;
  const testAppId = TEST_CLIENT_IDS.primary;

  beforeAll(async () => {
    // Get access tokens for all three test users
    // Primary user (has a referral code in seed data)
    const primaryFlow = await startOAuthFlow({
      clientId: testAppId,
    });
    const primaryAuthUrl = await echoControlApi.validateOAuthAuthorizeRequest({
      client_id: primaryFlow.clientId,
      redirect_uri: primaryFlow.redirectUri,
      state: primaryFlow.state,
      code_challenge: primaryFlow.codeChallenge,
      code_challenge_method: 'S256',
      scope: primaryFlow.scope,
    });
    const primaryAuthCode =
      extractAuthorizationCodeFromUrl(primaryAuthUrl).code;
    const primaryTokens = await completeOAuthFlow(primaryAuthCode, primaryFlow);
    primaryUserAccessToken = primaryTokens.access_token;

    // Secondary user (also has a referral code in seed data)
    const api2 = new (echoControlApi.constructor as any)(
      TEST_CONFIG.services.echoControl,
      'test-user-2'
    );
    const secondaryFlow = await startOAuthFlow({
      clientId: testAppId,
    });
    const secondaryAuthUrl = await api2.validateOAuthAuthorizeRequest({
      client_id: secondaryFlow.clientId,
      redirect_uri: secondaryFlow.redirectUri,
      state: secondaryFlow.state,
      code_challenge: secondaryFlow.codeChallenge,
      code_challenge_method: 'S256',
      scope: secondaryFlow.scope,
    });
    const secondaryAuthCode =
      extractAuthorizationCodeFromUrl(secondaryAuthUrl).code;
    const secondaryTokens = await completeOAuthFlow(
      secondaryAuthCode,
      secondaryFlow
    );
    secondaryUserAccessToken = secondaryTokens.access_token;

    // Tertiary user (does not have a referral code yet)
    const api3 = new (echoControlApi.constructor as any)(
      TEST_CONFIG.services.echoControl,
      'test-user-3'
    );
    const tertiaryFlow = await startOAuthFlow({
      clientId: testAppId,
    });
    const tertiaryAuthUrl = await api3.validateOAuthAuthorizeRequest({
      client_id: tertiaryFlow.clientId,
      redirect_uri: tertiaryFlow.redirectUri,
      state: tertiaryFlow.state,
      code_challenge: tertiaryFlow.codeChallenge,
      code_challenge_method: 'S256',
      scope: tertiaryFlow.scope,
    });
    const tertiaryAuthCode =
      extractAuthorizationCodeFromUrl(tertiaryAuthUrl).code;
    const tertiaryTokens = await completeOAuthFlow(
      tertiaryAuthCode,
      tertiaryFlow
    );
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

