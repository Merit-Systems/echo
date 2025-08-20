import { TokenProvider } from '../../echo-typescript-sdk/src/auth/token-provider.js';
import prompts from 'prompts';
import open from 'open';

/**
 * Token provider that stores API keys on disk in ~/.echo directory
 * organized by app_id for cross-platform compatibility
 */
export class DiskProvider implements TokenProvider {
  private appId: string;

  constructor(appId: string) {
    this.appId = appId;
  }

  /**
   * Prompts for API key if none exists. Opens browser to auth page.
   * Does nothing if key is already saved.
   */
  async prompt(): Promise<void> {
    if (!(await this.hasApiKey())) {
      await this.promptForAPIKey();
    }
  }

  private async promptForAPIKey(): Promise<void> {
    console.log('Opening browser to get your API key...');
    await open(`https://echo.merit.systems/cli-auth/${this.appId}`);

    const response = await prompts({
      type: 'password',
      name: 'apiKey',
      message: 'Enter your API key:',
    });

    if (response.apiKey) {
      await this.saveApiKey(response.apiKey);
      console.log('API key saved successfully!');
    } else {
      console.log('API key is required');
      process.exit(1);
    }
  }

  async getAccessToken(): Promise<string | null> {
    try {
      const { readFileSync, existsSync } = await import('fs');
      const { join } = await import('path');
      const { homedir } = await import('os');

      const echoDir = join(homedir(), '.echo');
      const keyFile = join(echoDir, `${this.appId}.key`);

      if (!existsSync(keyFile)) {
        return null;
      }

      const apiKey = readFileSync(keyFile, 'utf-8').trim();
      return apiKey || null;
    } catch (error) {
      return null;
    }
  }

  async refreshToken(): Promise<void> {
    return Promise.resolve();
  }

  async hasApiKey(): Promise<boolean> {
    try {
      const { existsSync } = await import('fs');
      const { join } = await import('path');
      const { homedir } = await import('os');

      const echoDir = join(homedir(), '.echo');
      const keyFile = join(echoDir, `${this.appId}.key`);

      return existsSync(keyFile);
    } catch (error) {
      return false;
    }
  }

  async saveApiKey(apiKey: string): Promise<void> {
    try {
      const { writeFileSync, mkdirSync, existsSync } = await import('fs');
      const { join } = await import('path');
      const { homedir } = await import('os');

      const echoDir = join(homedir(), '.echo');

      if (!existsSync(echoDir)) {
        mkdirSync(echoDir, { recursive: true });
      }

      const keyFile = join(echoDir, `${this.appId}.key`);
      writeFileSync(keyFile, apiKey, 'utf-8');
    } catch (error) {
      throw new Error(
        `Failed to save API key: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
