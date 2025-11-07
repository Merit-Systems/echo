import { Command } from 'commander';
import chalk from 'chalk';
import { readFileSync } from 'fs';
import { authenticateWithEcho } from './auth.js';
import { isAuthenticated, clearConfig } from './config.js';

const program = new Command();

// Get version from package.json
const packageJson = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf-8')
);
const VERSION = packageJson.version;

program
  .name('echoai')
  .description('CLI tool for authenticating with Echo')
  .version(VERSION);

// Auth command
program
  .command('auth')
  .description('Authenticate with Echo using OAuth2')
  .action(async () => {
    try {
      await authenticateWithEcho();
    } catch (error) {
      console.error(chalk.red('Authentication failed:'), error);
      process.exit(1);
    }
  });

// Status command
program
  .command('status')
  .description('Check authentication status')
  .action(() => {
    if (isAuthenticated()) {
      console.log(chalk.green('✓ Authenticated'));
    } else {
      console.log(chalk.yellow('✗ Not authenticated'));
      console.log(chalk.gray('Run "echoai auth" to authenticate'));
    }
  });

// Logout command
program
  .command('logout')
  .description('Clear authentication tokens')
  .action(() => {
    clearConfig();
    console.log(chalk.green('✓ Logged out successfully'));
  });

// Default action when no command is provided
program.action(() => {
  program.help();
});

async function main() {
  try {
    await program.parseAsync(process.argv);
  } catch (error) {
    console.error(chalk.red('An error occurred:'), error);
    process.exit(1);
  }
}

main();
