import chalk from 'chalk';
import inquirer from 'inquirer';
import open from 'open';
import { EchoClient } from './client.js';
import type { EchoApp, Balance, CreatePaymentLinkResponse } from './types.js';

// Re-export the Balance type from types.ts as EchoBalance for backwards compatibility
export type EchoBalance = Balance;

export interface LoginOptions {
  baseUrl?: string;
  silent?: boolean;
}

export interface PaymentOptions {
  amount?: number;
  description?: string;
  interactive?: boolean;
}

/**
 * Get an authenticated Echo client
 * @throws {Error} If no valid authentication is found
 */
export async function getAuthenticatedEchoClient(): Promise<EchoClient> {
  return new EchoClient({ apiKey: process.env.ECHO_API_KEY ?? '' });
}

/**
 * Authenticate with Echo and store API key
 * @param options - Login configuration options
 * @returns Promise that resolves when login is complete
 */
export async function loginToEcho(options: LoginOptions = {}): Promise<void> {
  const {
    baseUrl = process.env.ECHO_BASE_URL || 'http://localhost:3000',
    silent = false,
  } = options;

  if (!silent) {
    console.log(chalk.blue('🔐 Echo Authentication'));
    console.log();
  }

  const authUrl = `${baseUrl}/cli-auth`;

  if (!silent) {
    console.log(
      chalk.yellow('Opening Echo CLI authentication page in your browser...')
    );
    console.log(chalk.gray(`URL: ${authUrl}`));
    console.log();
  }

  // Open the browser
  try {
    await open(authUrl);
  } catch (error) {
    if (!silent) {
      console.log(
        chalk.yellow('Could not open browser automatically. Please visit:')
      );
      console.log(chalk.cyan(authUrl));
      console.log();
    }
  }

  if (!silent) {
    console.log(chalk.cyan('In the browser:'));
    console.log(chalk.cyan('1. Sign in to your Echo account if needed'));
    console.log(
      chalk.cyan('2. Select the Echo app you want to use with the CLI')
    );
    console.log(chalk.cyan('3. Generate a new app-scoped API key'));
    console.log(chalk.cyan('4. Copy the API key'));
    console.log();
    console.log(
      chalk.yellow(
        'Once you have your API key, run this command in your terminal:'
      )
    );
    console.log(chalk.green('export ECHO_API_KEY="your_api_key_here"'));
    console.log();
    console.log(
      chalk.gray('Replace "your_api_key_here" with your actual API key')
    );
    console.log(chalk.gray('Then run your Echo CLI command again.'));
    console.log();
  }

  // Check if API key is already set in environment
  const cleanApiKey = process.env.ECHO_API_KEY?.trim();

  if (!cleanApiKey) {
    const message =
      'No API key found. Please export ECHO_API_KEY environment variable first.';
    if (!silent) {
      console.log(chalk.red('❌ ' + message));
      console.log(chalk.yellow('Run: export ECHO_API_KEY="your_api_key_here"'));
    }
  }

  // Store the API key
  process.env.ECHO_API_KEY = cleanApiKey;
  if (!silent) {
    console.log(chalk.green('🔑 API key stored securely'));
    console.log();
    console.log(
      chalk.green('🎉 Authentication complete! You can now use Echo features.')
    );
  }
}

/**
 * Remove stored Echo credentials
 * @param silent - Whether to suppress console output
 */
export async function logoutFromEcho(silent: boolean = false): Promise<void> {
  delete process.env.ECHO_API_KEY;
  if (!silent) {
    console.log(chalk.green('✅ Successfully logged out from Echo!'));
  }
}

/**
 * Get list of Echo applications
 * @param silent - Whether to suppress console output
 * @returns Promise that resolves to array of Echo apps
 */
export async function listEchoApps(
  silent: boolean = false
): Promise<EchoApp[]> {
  const client = await getAuthenticatedEchoClient();

  if (!silent) {
    console.log(chalk.blue('📱 Fetching your Echo apps...'));
  }

  const echoApps = await client.listEchoApps();

  if (!silent) {
    if (echoApps.length === 0) {
      console.log(chalk.yellow('No Echo apps found. Create one first!'));
      return echoApps;
    }

    console.log(chalk.green(`\n✅ Found ${echoApps.length} Echo app(s):\n`));

    echoApps.forEach((app, index) => {
      console.log(
        `${chalk.bold(`${index + 1}. ${app.name}`)} ${chalk.gray(`(${app.id})`)}`
      );
      if (app.description) {
        console.log(`   ${chalk.gray(app.description)}`);
      }
      if (app.totalTokens !== undefined) {
        console.log(
          `   Tokens: ${chalk.blue(app.totalTokens.toLocaleString())}`
        );
      }
      if (app.totalCost !== undefined) {
        console.log(`   Cost: ${chalk.green(`$${app.totalCost.toFixed(4)}`)}`);
      }
      console.log();
    });
  }

  return echoApps;
}

/**
 * Get Echo account balance
 * @param silent - Whether to suppress console output
 * @returns Promise that resolves to balance information
 */
export async function getEchoBalance(
  silent: boolean = false
): Promise<EchoBalance> {
  const client = await getAuthenticatedEchoClient();

  if (!silent) {
    console.log(chalk.blue('💰 Fetching your balance...'));
  }

  const balance = await client.getBalance();

  if (!silent) {
    console.log(chalk.green(`Balance: $${balance.balance.toFixed(2)}`));
    console.log(chalk.gray(`Total Credits: $${balance.totalPaid.toFixed(2)}`));
    console.log(chalk.gray(`Total Spent: $${balance.totalSpent.toFixed(2)}`));
  }

  return balance;
}

/**
 * Create an Echo payment link
 * @param options - Payment configuration options
 * @returns Promise that resolves to payment link response
 */
export async function createEchoPaymentLink(
  options: PaymentOptions = {}
): Promise<CreatePaymentLinkResponse> {
  const client = await getAuthenticatedEchoClient();

  let { amount, description, interactive = true } = options;

  if (!amount && interactive) {
    const answers = await inquirer.prompt([
      {
        type: 'number',
        name: 'amount',
        message: 'Enter the amount in USD:',
        validate: input => input > 0 || 'Amount must be greater than 0',
      },
      {
        type: 'input',
        name: 'description',
        message: 'Enter payment description (optional):',
        default: 'Echo credits',
      },
    ]);
    amount = answers.amount;
    description = answers.description;
  }

  if (!amount) {
    throw new Error('Amount is required for payment link creation');
  }

  if (!description) {
    description = 'Echo credits';
  }

  if (interactive) {
    console.log(chalk.blue('💳 Generating payment link...'));
  }

  const response = await client.createPaymentLink({
    amount: parseFloat(amount.toString()),
    description,
  });

  if (interactive) {
    console.log(chalk.green('✅ Payment link generated successfully!'));
    console.log(chalk.blue(`🔗 Link: ${response.paymentLink.url}`));
  }

  return response;
}

/**
 * Display the Echo CLI banner
 */
export function displayEchoBanner(): void {
  console.log(
    chalk.cyan(
      '███████╗ ██████╗██╗  ██╗ ██████╗ \n' +
        '██╔════╝██╔════╝██║  ██║██╔═══██╗\n' +
        '█████╗  ██║     ███████║██║   ██║\n' +
        '██╔══╝  ██║     ██╔══██║██║   ██║\n' +
        '███████╗╚██████╗██║  ██║╚██████╔╝\n' +
        '╚══════╝ ╚═════╝╚═╝  ╚═╝ ╚═════╝'
    )
  );
  console.log(
    chalk.gray('Manage your Echo applications from the command line\n')
  );
}
