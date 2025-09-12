import { Page, Browser, BrowserContext, expect } from '@playwright/test';
import { OAuthFlowResult } from './auth-helpers';

export interface BrowserOAuthFlowOptions {
  page: Page;
  flowResult: OAuthFlowResult;
  userEmail?: string;
  autoApprove?: boolean;
  waitForCallback?: boolean;
}

export interface BrowserOAuthFlowResult {
  authorizationCode: string;
  state: string;
  callbackUrl: string;
}

export class BrowserHelpers {
  // Navigate to OAuth authorization URL and simulate user flow
  static async simulateOAuthFlow(
    options: BrowserOAuthFlowOptions
  ): Promise<BrowserOAuthFlowResult> {
    const {
      page,
      flowResult,
      userEmail = 'test@example.com',
      autoApprove = true,
      waitForCallback = true,
    } = options;

    // Navigate to authorization URL
    await page.goto(flowResult.authorizationUrl);

    // Wait for the authorization page to load
    await expect(page).toHaveTitle(/authorize|login|sign/i);

    // If not already signed in, handle login
    const isLoginPage = await page
      .locator('input[type="email"], input[name="email"]')
      .isVisible();
    if (isLoginPage) {
      await this.handleLogin(page, userEmail);
    }

    // Handle authorization consent
    if (autoApprove) {
      await this.handleAuthorizationConsent(page);
    }

    // Wait for callback if requested
    if (waitForCallback) {
      return this.waitForCallback(page, flowResult.redirectUri);
    }

    // If not waiting for callback, extract current URL info
    const currentUrl = page.url();
    const { code, state } = this.extractCallbackParams(currentUrl);

    return {
      authorizationCode: code,
      state,
      callbackUrl: currentUrl,
    };
  }

  // Handle login form (simplified for test user)
  static async handleLogin(page: Page, email: string): Promise<void> {
    // Look for email input
    const emailInput = page
      .locator('input[type="email"], input[name="email"]')
      .first();
    if (await emailInput.isVisible()) {
      await emailInput.fill(email);
    }

    // Look for password input
    const passwordInput = page
      .locator('input[type="password"], input[name="password"]')
      .first();
    if (await passwordInput.isVisible()) {
      await passwordInput.fill('testpassword123');
    }

    // Submit form
    const submitButton = page
      .locator(
        'button[type="submit"], input[type="submit"], button:has-text("sign in"), button:has-text("login")'
      )
      .first();
    if (await submitButton.isVisible()) {
      await submitButton.click();
    }

    // Wait for login to complete
    await page.waitForTimeout(1000);
  }

  // Handle OAuth authorization consent
  static async handleAuthorizationConsent(page: Page): Promise<void> {
    // Look for authorization/consent buttons
    const consentSelectors = [
      'button:has-text("authorize")',
      'button:has-text("approve")',
      'button:has-text("allow")',
      'button:has-text("accept")',
      'input[type="submit"][value*="approve"]',
      'input[type="submit"][value*="authorize"]',
    ];

    for (const selector of consentSelectors) {
      const button = page.locator(selector).first();
      if (await button.isVisible()) {
        await button.click();
        break;
      }
    }

    // Wait for redirect
    await page.waitForTimeout(1000);
  }

  // Wait for callback and extract parameters
  static async waitForCallback(
    page: Page,
    expectedCallbackUrl: string
  ): Promise<BrowserOAuthFlowResult> {
    const callbackDomain = new URL(expectedCallbackUrl).origin;

    // Wait for navigation to callback URL
    await page.waitForURL(url => url.toString().startsWith(callbackDomain), {
      timeout: 10000,
    });

    const callbackUrl = page.url();
    const { code, state } = this.extractCallbackParams(callbackUrl);

    return {
      authorizationCode: code,
      state,
      callbackUrl,
    };
  }

  // Extract authorization code and state from callback URL
  static extractCallbackParams(url: string): { code: string; state: string } {
    const urlObj = new URL(url);
    const code = urlObj.searchParams.get('code');
    const state = urlObj.searchParams.get('state');

    if (!code) {
      throw new Error(`Authorization code not found in callback URL: ${url}`);
    }

    if (!state) {
      throw new Error(`State parameter not found in callback URL: ${url}`);
    }

    return { code, state };
  }

  // Test cross-tab session synchronization
  static async testCrossTabSync(
    browser: Browser,
    url: string
  ): Promise<{
    tab1: Page;
    tab2: Page;
    context: BrowserContext;
  }> {
    const context = await browser.newContext();

    // Create two tabs
    const tab1 = await context.newPage();
    const tab2 = await context.newPage();

    // Navigate both tabs to the same URL
    await Promise.all([tab1.goto(url), tab2.goto(url)]);

    return { tab1, tab2, context };
  }

  // Test silent renewal in iframe
  static async testSilentRenewal(
    page: Page,
    renewalUrl: string
  ): Promise<boolean> {
    // Create iframe for silent renewal
    await page.addInitScript(() => {
      (window as any).silentRenewalResult = null;
      (window as any).silentRenewalError = null;
    });

    await page.evaluateHandle(url => {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = url;

      return new Promise((resolve, reject) => {
        iframe.onload = () => {
          try {
            // Try to access iframe content (will fail if cross-origin)
            const iframeWindow = iframe.contentWindow;
            const iframeUrl = iframeWindow?.location.href;

            if (iframeUrl && iframeUrl.includes('access_token')) {
              (window as any).silentRenewalResult = iframeUrl;
              resolve(iframe);
            } else {
              reject(new Error('Silent renewal failed'));
            }
          } catch (error) {
            (window as any).silentRenewalError = error;
            reject(error);
          }
        };

        iframe.onerror = error => {
          (window as any).silentRenewalError = error;
          reject(error);
        };

        document.body.appendChild(iframe);
      });
    }, renewalUrl);

    // Wait for silent renewal to complete
    await page.waitForFunction(
      () =>
        (window as any).silentRenewalResult !== null ||
        (window as any).silentRenewalError !== null,
      {},
      { timeout: 10000 }
    );

    const result = await page.evaluate(
      () => (window as any).silentRenewalResult
    );
    return !!result;
  }

  // Take screenshot for debugging
  static async takeDebugScreenshot(page: Page, name: string): Promise<void> {
    await page.screenshot({
      path: `test-results/debug-${name}-${Date.now()}.png`,
      fullPage: true,
    });
  }

  // Wait for API response
  static async waitForApiResponse(
    page: Page,
    urlPattern: string | RegExp
  ): Promise<any> {
    const response = await page.waitForResponse(response => {
      const url = response.url();
      if (typeof urlPattern === 'string') {
        return url.includes(urlPattern);
      }
      return urlPattern.test(url);
    });

    return response.json();
  }

  // Mock network response
  static async mockApiResponse(
    page: Page,
    urlPattern: string | RegExp,
    mockResponse: any
  ): Promise<void> {
    await page.route(urlPattern, route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockResponse),
      });
    });
  }

  // Test mobile viewport
  static async setMobileViewport(page: Page): Promise<void> {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
  }

  // Test accessibility
  static async checkAccessibility(page: Page): Promise<void> {
    // Basic accessibility checks
    const missingAltText = await page.locator('img:not([alt])').count();
    expect(missingAltText).toBe(0);

    const missingLabels = await page
      .locator('input:not([aria-label]):not([aria-labelledby]):not([id])')
      .count();
    expect(missingLabels).toBe(0);

    // Check for proper heading hierarchy
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    expect(headings.length).toBeGreaterThan(0);
  }

  // Performance testing
  static async measurePageLoadTime(page: Page, url: string): Promise<number> {
    const startTime = Date.now();
    await page.goto(url);
    await page.waitForLoadState('networkidle');
    const endTime = Date.now();
    return endTime - startTime;
  }
}
