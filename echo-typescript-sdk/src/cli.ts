#!/usr/bin/env node

import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import open from 'open';
import { storeApiKey, getStoredApiKey, removeStoredApiKey, validateApiKey } from './auth';
import { EchoClient } from './client';

const program = new Command();

program
  .name('echo-cli')
  .description('Echo TypeScript SDK CLI')
  .version('1.0.0');

program
  .command('login')
  .description('Authenticate with Echo platform')
  .action(async () => {
    try {
      console.log(chalk.blue('🔐 Echo Authentication'));
      console.log();

      const baseUrl = process.env.ECHO_BASE_URL || 'http://localhost:3000';
      const authUrl = `${baseUrl}/cli-auth`;

      console.log(chalk.yellow('Opening Echo CLI authentication page in your browser...'));
      console.log(chalk.gray(`URL: ${authUrl}`));
      console.log();

      // Open the browser
      await open(authUrl);

      console.log(chalk.cyan('In the browser:'));
      console.log(chalk.cyan('1. Sign in to your Echo account if needed'));
      console.log(chalk.cyan('2. Select the app you want to use with the CLI'));
      console.log(chalk.cyan('3. Generate a new API key'));
      console.log(chalk.cyan('4. Copy the API key and paste it below'));
      console.log();

      const answers = await inquirer.prompt([
        {
          type: 'password',
          name: 'apiKey',
          message: 'Paste your Echo API key:',
          mask: '*',
          validate: (input: string) => {
            if (!input.trim()) {
              return 'API key is required';
            }
            if (!validateApiKey(input.trim())) {
              return 'Invalid API key format. Expected format: echo_...';
            }
            return true;
          },
        },
      ]);

      const apiKey = answers.apiKey.trim();

      // Test the API key
      console.log(chalk.yellow('🔍 Verifying API key...'));
      const client = new EchoClient({ apiKey });
      
      try {
        const apps = await client.listEchoApps();
        console.log(chalk.green('✅ API key verified successfully!'));
        console.log(chalk.gray(`Found ${apps.length} Echo app(s)`));
      } catch (error) {
        console.log(chalk.red('❌ API key verification failed'));
        console.log(chalk.red(`Error: ${error}`));
        process.exit(1);
      }

      // Store the API key
      await storeApiKey(apiKey);
      console.log(chalk.green('🔑 API key stored securely'));
      console.log();
      console.log(chalk.green('🎉 Authentication complete! You can now use the Echo CLI.'));
    } catch (error) {
      console.error(chalk.red('❌ Authentication failed:'), error);
      process.exit(1);
    }
  });

program
  .command('logout')
  .description('Remove stored authentication')
  .action(async () => {
    try {
      await removeStoredApiKey();
      console.log(chalk.green('✅ Logged out successfully'));
    } catch (error) {
      console.error(chalk.red('❌ Logout failed:'), error);
      process.exit(1);
    }
  });

program
  .command('whoami')
  .description('Show current authentication status')
  .action(async () => {
    try {
      const apiKey = await getStoredApiKey();
      if (!apiKey) {
        console.log(chalk.yellow('❌ Not authenticated. Run "echo-cli login" to authenticate.'));
        return;
      }

      console.log(chalk.green('✅ Authenticated'));
      console.log(chalk.gray(`API Key: ${apiKey.substring(0, 10)}...`));

      // Test the connection
      const client = new EchoClient();
      try {
        const apps = await client.listEchoApps();
        console.log(chalk.gray(`Connected to Echo (${apps.length} app(s) found)`));
      } catch (error) {
        console.log(chalk.red('⚠️  API key might be invalid or expired'));
      }
    } catch (error) {
      console.error(chalk.red('❌ Error checking authentication:'), error);
      process.exit(1);
    }
  });

program
  .command('balance')
  .description('Get account balance')
  .option('-a, --app <appId>', 'Get balance for specific app')
  .action(async (options) => {
    try {
      const client = new EchoClient();
      const balance = await client.getBalance(options.app);

      console.log(chalk.blue('💰 Account Balance'));
      console.log(chalk.green(`Balance: $${balance.balance} ${balance.currency}`));
      console.log(chalk.gray(`Total Credits: $${balance.totalCredits}`));
      console.log(chalk.gray(`Total Spent: $${balance.totalSpent}`));
      
      if (balance.echoAppId) {
        console.log(chalk.gray(`App: ${balance.echoAppId}`));
      }
    } catch (error) {
      console.error(chalk.red('❌ Failed to fetch balance:'), error);
      process.exit(1);
    }
  });

program
  .command('apps')
  .description('List your Echo apps')
  .action(async () => {
    try {
      const client = new EchoClient();
      const apps = await client.listEchoApps();

      if (apps.length === 0) {
        console.log(chalk.yellow('No Echo apps found. Create one at your Echo dashboard.'));
        return;
      }

      console.log(chalk.blue('📱 Your Echo Apps'));
      console.log();

      apps.forEach((app, index) => {
        console.log(chalk.green(`${index + 1}. ${app.name}`));
        console.log(chalk.gray(`   ID: ${app.id}`));
        console.log(chalk.gray(`   URL: ${client.getAppUrl(app.id)}`));
        if (app.description) {
          console.log(chalk.gray(`   Description: ${app.description}`));
        }
        if (app.totalCost !== undefined) {
          console.log(chalk.gray(`   Total Cost: $${app.totalCost}`));
        }
        console.log();
      });
    } catch (error) {
      console.error(chalk.red('❌ Failed to fetch apps:'), error);
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse();

// If no command provided, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
} 