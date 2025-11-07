import { intro, outro, text, isCancel, cancel } from '@clack/prompts';
import chalk from 'chalk';
import { setAppId, setAccessToken, setRefreshToken } from './config.js';
import { authenticateWithOAuth } from './oauth.js';

/**
 * Authenticate with Echo using OAuth2 + PKCE
 */
export async function authenticateWithEcho(): Promise<void> {
  intro(chalk.cyan('Echo Authentication'));

  console.log(chalk.gray('\nAuthenticate with Echo to use the CLI.\n'));

  const appId = await text({
    message: 'Enter your Echo App ID:',
    placeholder: 'Enter your app ID from https://echo.merit.systems/my-apps',
    validate: (value: string) => {
      if (!value.trim()) {
        return 'App ID is required';
      }
      return undefined;
    },
  });

  if (isCancel(appId)) {
    cancel('Authentication cancelled.');
    process.exit(1);
  }

  try {
    console.log();
    const tokens = await authenticateWithOAuth(appId.trim());

    // Save tokens
    setAppId(appId.trim());
    setAccessToken(tokens.accessToken);
    setRefreshToken(tokens.refreshToken);

    outro(chalk.green('✓ Authentication successful!'));
  } catch (error) {
    if (error instanceof Error) {
      console.log(chalk.red(`\n✗ Authentication failed: ${error.message}`));
    } else {
      console.log(chalk.red('\n✗ Authentication failed'));
    }
    process.exit(1);
  }
}

