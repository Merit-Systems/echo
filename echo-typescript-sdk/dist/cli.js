#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const inquirer_1 = __importDefault(require("inquirer"));
const chalk_1 = __importDefault(require("chalk"));
const open_1 = __importDefault(require("open"));
const auth_1 = require("./auth");
const client_1 = require("./client");
const program = new commander_1.Command();
program
    .name('echo-cli')
    .description('Echo TypeScript SDK CLI')
    .version('1.0.0');
program
    .command('login')
    .description('Authenticate with Echo platform')
    .action(async () => {
    try {
        console.log(chalk_1.default.blue('🔐 Echo Authentication'));
        console.log();
        const baseUrl = process.env.ECHO_BASE_URL || 'http://localhost:3000';
        const authUrl = `${baseUrl}/cli-auth`;
        console.log(chalk_1.default.yellow('Opening Echo CLI authentication page in your browser...'));
        console.log(chalk_1.default.gray(`URL: ${authUrl}`));
        console.log();
        // Open the browser
        await (0, open_1.default)(authUrl);
        console.log(chalk_1.default.cyan('In the browser:'));
        console.log(chalk_1.default.cyan('1. Sign in to your Echo account if needed'));
        console.log(chalk_1.default.cyan('2. Select the app you want to use with the CLI'));
        console.log(chalk_1.default.cyan('3. Generate a new API key'));
        console.log(chalk_1.default.cyan('4. Copy the API key and paste it below'));
        console.log();
        const answers = await inquirer_1.default.prompt([
            {
                type: 'password',
                name: 'apiKey',
                message: 'Paste your Echo API key:',
                mask: '*',
                validate: (input) => {
                    if (!input.trim()) {
                        return 'API key is required';
                    }
                    if (!(0, auth_1.validateApiKey)(input.trim())) {
                        return 'Invalid API key format. Expected format: echo_...';
                    }
                    return true;
                },
            },
        ]);
        const apiKey = answers.apiKey.trim();
        // Test the API key
        console.log(chalk_1.default.yellow('🔍 Verifying API key...'));
        const client = new client_1.EchoClient({ apiKey });
        try {
            const apps = await client.listEchoApps();
            console.log(chalk_1.default.green('✅ API key verified successfully!'));
            console.log(chalk_1.default.gray(`Found ${apps.length} Echo app(s)`));
        }
        catch (error) {
            console.log(chalk_1.default.red('❌ API key verification failed'));
            console.log(chalk_1.default.red(`Error: ${error}`));
            process.exit(1);
        }
        // Store the API key
        await (0, auth_1.storeApiKey)(apiKey);
        console.log(chalk_1.default.green('🔑 API key stored securely'));
        console.log();
        console.log(chalk_1.default.green('🎉 Authentication complete! You can now use the Echo CLI.'));
    }
    catch (error) {
        console.error(chalk_1.default.red('❌ Authentication failed:'), error);
        process.exit(1);
    }
});
program
    .command('logout')
    .description('Remove stored authentication')
    .action(async () => {
    try {
        await (0, auth_1.removeStoredApiKey)();
        console.log(chalk_1.default.green('✅ Logged out successfully'));
    }
    catch (error) {
        console.error(chalk_1.default.red('❌ Logout failed:'), error);
        process.exit(1);
    }
});
program
    .command('whoami')
    .description('Show current authentication status')
    .action(async () => {
    try {
        const apiKey = await (0, auth_1.getStoredApiKey)();
        if (!apiKey) {
            console.log(chalk_1.default.yellow('❌ Not authenticated. Run "echo-cli login" to authenticate.'));
            return;
        }
        console.log(chalk_1.default.green('✅ Authenticated'));
        console.log(chalk_1.default.gray(`API Key: ${apiKey.substring(0, 10)}...`));
        // Test the connection
        const client = new client_1.EchoClient();
        try {
            const apps = await client.listEchoApps();
            console.log(chalk_1.default.gray(`Connected to Echo (${apps.length} app(s) found)`));
        }
        catch (error) {
            console.log(chalk_1.default.red('⚠️  API key might be invalid or expired'));
        }
    }
    catch (error) {
        console.error(chalk_1.default.red('❌ Error checking authentication:'), error);
        process.exit(1);
    }
});
program
    .command('balance')
    .description('Get account balance')
    .option('-a, --app <appId>', 'Get balance for specific app')
    .action(async (options) => {
    try {
        const client = new client_1.EchoClient();
        const balance = await client.getBalance(options.app);
        console.log(chalk_1.default.blue('💰 Account Balance'));
        console.log(chalk_1.default.green(`Balance: $${balance.balance} ${balance.currency}`));
        console.log(chalk_1.default.gray(`Total Credits: $${balance.totalCredits}`));
        console.log(chalk_1.default.gray(`Total Spent: $${balance.totalSpent}`));
        if (balance.echoAppId) {
            console.log(chalk_1.default.gray(`App: ${balance.echoAppId}`));
        }
    }
    catch (error) {
        console.error(chalk_1.default.red('❌ Failed to fetch balance:'), error);
        process.exit(1);
    }
});
program
    .command('apps')
    .description('List your Echo apps')
    .action(async () => {
    try {
        const client = new client_1.EchoClient();
        const apps = await client.listEchoApps();
        if (apps.length === 0) {
            console.log(chalk_1.default.yellow('No Echo apps found. Create one at your Echo dashboard.'));
            return;
        }
        console.log(chalk_1.default.blue('📱 Your Echo Apps'));
        console.log();
        apps.forEach((app, index) => {
            console.log(chalk_1.default.green(`${index + 1}. ${app.name}`));
            console.log(chalk_1.default.gray(`   ID: ${app.id}`));
            console.log(chalk_1.default.gray(`   URL: ${client.getAppUrl(app.id)}`));
            if (app.description) {
                console.log(chalk_1.default.gray(`   Description: ${app.description}`));
            }
            if (app.totalCost !== undefined) {
                console.log(chalk_1.default.gray(`   Total Cost: $${app.totalCost}`));
            }
            console.log();
        });
    }
    catch (error) {
        console.error(chalk_1.default.red('❌ Failed to fetch apps:'), error);
        process.exit(1);
    }
});
// Parse command line arguments
program.parse();
// If no command provided, show help
if (!process.argv.slice(2).length) {
    program.outputHelp();
}
//# sourceMappingURL=cli.js.map