#!/usr/bin/env node

import {
  cancel,
  intro,
  isCancel,
  log,
  outro,
  select,
  spinner,
  text,
} from '@clack/prompts';
import chalk from 'chalk';
import { createHash, randomBytes } from 'crypto';
import { spawn } from 'child_process';
import { Command } from 'commander';
import degit from 'degit';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { createServer } from 'http';
import path from 'path';

const program = new Command();

// Get version from package.json
const packageJsonPath = new URL('../package.json', import.meta.url);
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
const VERSION = packageJson.version;

// Available templates - add new ones here
const DEFAULT_TEMPLATES = {
  next: {
    title: 'Next.js',
    description: 'Minimal Next.js application with Echo integration',
  },
  vite: {
    repo: 'Merit-Systems/echo/templates/react',
    title: 'React (Vite)',
    description: 'Minimal Vite React application with Echo integration',
  },
  'assistant-ui': {
    title: 'Assistant UI',
    description: 'Full-featured chat UI with @assistant-ui/react and AI SDK v5',
  },
  'next-chat': {
    title: 'Next.js Chat',
    description:
      'Full-stack Next.js application with Echo and the Vercel AI SDK',
  },
  'next-image': {
    title: 'Next.js Image Gen',
    description:
      'Full-stack Next.js application with Echo and the Vercel AI SDK for image generation',
  },
  'next-video-template': {
    title: 'Next.js Video Gen',
    description:
      'Full-stack Next.js application with Echo and the Vercel AI SDK for video generation',
  },
  'nextjs-api-key-template': {
    title: 'Next.js API Key',
    description:
      'Next.js application with server-side API key management and database',
  },
  'react-chat': {
    title: 'React Chat',
    description: 'Vite React application with Echo and the Vercel AI SDK',
  },
  'react-image': {
    title: 'React Image Gen',
    description:
      'Vite React application with Echo and the Vercel AI SDK for image generation',
  },
  'echo-cli': {
    title: 'Echo CLI',
    description: 'Command-line tool for AI chat powered by Echo',
  },
  authjs: {
    title: 'Auth.js (NextAuth)',
    description:
      'Next.js application with Echo as an Auth.js provider for authentication',
  },
} as const;

type TemplateName = keyof typeof DEFAULT_TEMPLATES;
type PackageManager = 'pnpm' | 'npm' | 'yarn' | 'bun';

const DEFAULT_ECHO_BASE_URL = 'https://echo.merit.systems';
const REFERRAL_CALLBACK_PATH = '/echo-start-referral-callback';
const REFERRAL_OAUTH_TIMEOUT_MS = 120_000;

function printHeader(): void {
  console.log();
  console.log(`${chalk.cyan('Echo Start')} ${chalk.gray(`(${VERSION})`)}`);
  console.log();
}

function detectPackageManager(): PackageManager {
  const userAgent = process.env.npm_config_user_agent || '';

  if (userAgent.includes('pnpm')) return 'pnpm';
  if (userAgent.includes('yarn')) return 'yarn';
  if (userAgent.includes('bun')) return 'bun';
  if (userAgent.includes('npm')) return 'npm';

  // Default to pnpm (Echo's preference)
  return 'pnpm';
}

function getPackageManagerCommands(pm: PackageManager): {
  install: string;
  dev: string;
} {
  switch (pm) {
    case 'pnpm':
      return { install: 'pnpm install', dev: 'pnpm dev' };
    case 'yarn':
      return { install: 'yarn install', dev: 'yarn dev' };
    case 'bun':
      return { install: 'bun install', dev: 'bun dev' };
    case 'npm':
    default:
      return { install: 'npm install', dev: 'npm run dev' };
  }
}

function cleanProgressLine(line: string, maxLength: number): string {
  return line
    .replace(/\x1b\[[0-9;]*m/g, '') // Remove ANSI color codes
    .trim()
    .substring(0, maxLength);
}

function calculateProgressSpace(packageManager: PackageManager): number {
  const terminalWidth = process.stdout.columns || 80;
  const mainMessage = `Installing dependencies with ${packageManager}... `;
  return Math.max(20, terminalWidth - mainMessage.length - 10);
}

async function runInstall(
  packageManager: PackageManager,
  projectPath: string,
  onProgress?: (line: string) => void
): Promise<boolean> {
  return new Promise(resolve => {
    const command = packageManager;
    const args = ['install'];

    const child = spawn(command, args, {
      cwd: projectPath,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let lastLine = '';

    child.stdout?.on('data', data => {
      const lines = data.toString().split('\n');
      const relevantLine = lines
        .filter((line: string) => line.trim().length > 0)
        .pop(); // Get the last non-empty line

      if (relevantLine && onProgress) {
        const availableSpace = calculateProgressSpace(packageManager);
        const cleanLine = cleanProgressLine(relevantLine, availableSpace);
        if (cleanLine !== lastLine && cleanLine.length > 0) {
          onProgress(cleanLine);
          lastLine = cleanLine;
        }
      }
    });

    child.on('close', code => {
      resolve(code === 0);
    });

    child.on('error', () => {
      resolve(false);
    });
  });
}

interface CreateAppOptions {
  template?: string;
  appId?: string;
  skipInstall?: boolean;
}

function isExternalTemplate(template: string): boolean {
  return (
    template.startsWith('https://github.com/') ||
    template.startsWith('http://github.com/')
  );
}

function resolveTemplateRepo(template: string): string {
  let repo = template;

  if (
    repo.startsWith('https://github.com/') ||
    repo.startsWith('http://github.com/')
  ) {
    repo = repo.replace(/^https?:\/\/github\.com\//, '');
  }

  if (repo.endsWith('.git')) {
    repo = repo.slice(0, -4);
  }

  return repo;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function sanitizeReferralCode(code: unknown): string | null {
  if (typeof code !== 'string') {
    return null;
  }

  const trimmedCode = code.trim();
  if (!trimmedCode) {
    return null;
  }

  if (!/^[a-zA-Z0-9_.-]+$/.test(trimmedCode)) {
    return null;
  }

  if (trimmedCode.length > 128) {
    return null;
  }

  return trimmedCode;
}

interface TemplateReferralCodeResult {
  referralCode: string | null;
  sourcePath: string | null;
  invalidCodeFound: boolean;
}

function readJsonFile(filePath: string): unknown {
  try {
    return JSON.parse(readFileSync(filePath, 'utf-8'));
  } catch {
    return null;
  }
}

function extractTemplateReferralCode(
  projectPath: string
): TemplateReferralCodeResult {
  const candidates = [
    {
      path: 'echo.config.json',
      extractor: (value: unknown) => {
        if (!isObject(value)) {
          return undefined;
        }
        return value.referralCode ?? value.referral_code;
      },
    },
    {
      path: '.echo/template.json',
      extractor: (value: unknown) => {
        if (!isObject(value)) {
          return undefined;
        }

        if (value.referralCode || value.referral_code) {
          return value.referralCode ?? value.referral_code;
        }

        const template = value.template;
        if (isObject(template)) {
          return template.referralCode ?? template.referral_code;
        }

        return undefined;
      },
    },
    {
      path: 'echo-template.json',
      extractor: (value: unknown) => {
        if (!isObject(value)) {
          return undefined;
        }
        return value.referralCode ?? value.referral_code;
      },
    },
    {
      path: 'package.json',
      extractor: (value: unknown) => {
        if (!isObject(value)) {
          return undefined;
        }

        if (value.referralCode || value.referral_code) {
          return value.referralCode ?? value.referral_code;
        }

        const echo = value.echo;
        if (isObject(echo)) {
          return echo.referralCode ?? echo.referral_code;
        }

        return undefined;
      },
    },
  ];

  for (const candidate of candidates) {
    const filePath = path.join(projectPath, candidate.path);

    if (!existsSync(filePath)) {
      continue;
    }

    const parsed = readJsonFile(filePath);
    const rawCode = candidate.extractor(parsed);

    if (rawCode === undefined) {
      continue;
    }

    const referralCode = sanitizeReferralCode(rawCode);
    return {
      referralCode,
      sourcePath: candidate.path,
      invalidCodeFound: referralCode === null,
    };
  }

  return {
    referralCode: null,
    sourcePath: null,
    invalidCodeFound: false,
  };
}

function resolveEchoBaseUrl(): string {
  const baseUrl =
    process.env.ECHO_BASE_URL ||
    process.env.ECHO_CONTROL_URL ||
    DEFAULT_ECHO_BASE_URL;

  return baseUrl.replace(/\/+$/, '');
}

function toBase64Url(buffer: Buffer): string {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function createPkcePair(): { verifier: string; challenge: string } {
  const verifier = toBase64Url(randomBytes(32));
  const challenge = toBase64Url(
    createHash('sha256').update(verifier).digest()
  );
  return { verifier, challenge };
}

function getBrowserOpenCommand(url: string): [string, string[]] {
  if (process.platform === 'darwin') {
    return ['open', [url]];
  }

  if (process.platform === 'win32') {
    return ['cmd', ['/c', 'start', '', url]];
  }

  return ['xdg-open', [url]];
}

async function openUrlInBrowser(url: string): Promise<boolean> {
  const [command, args] = getBrowserOpenCommand(url);

  return new Promise(resolve => {
    const child = spawn(command, args, {
      stdio: 'ignore',
      detached: true,
    });

    let settled = false;
    const complete = (result: boolean) => {
      if (settled) {
        return;
      }
      settled = true;
      resolve(result);
    };

    child.once('error', () => complete(false));
    child.once('spawn', () => complete(true));
    setTimeout(() => complete(true), 300);
    child.unref();
  });
}

interface AuthorizationCodeResult {
  code: string;
  codeVerifier: string;
  redirectUri: string;
}

async function getAuthorizationCode({
  appId,
  baseUrl,
}: {
  appId: string;
  baseUrl: string;
}): Promise<AuthorizationCodeResult | null> {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    return null;
  }

  return await new Promise(resolve => {
    const server = createServer((req, res) => {
      const requestUrl = new URL(req.url || '/', `http://${req.headers.host}`);

      if (requestUrl.pathname !== REFERRAL_CALLBACK_PATH) {
        res.statusCode = 404;
        res.end('Not Found');
        return;
      }

      const code = requestUrl.searchParams.get('code');
      const state = requestUrl.searchParams.get('state');
      const error = requestUrl.searchParams.get('error');

      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(
        '<!doctype html><html><body><p>You can return to your terminal.</p></body></html>'
      );

      clearTimeout(timeout);
      server.close();

      if (error || !code || state !== oauthState) {
        resolve(null);
        return;
      }

      resolve({
        code,
        codeVerifier,
        redirectUri,
      });
    });

    const timeout = setTimeout(() => {
      server.close();
      resolve(null);
    }, REFERRAL_OAUTH_TIMEOUT_MS);

    const { verifier: codeVerifier, challenge: codeChallenge } = createPkcePair();
    const oauthState = toBase64Url(randomBytes(24));
    let redirectUri = '';

    server.on('error', () => {
      clearTimeout(timeout);
      resolve(null);
    });

    server.listen(0, 'localhost', async () => {
      const address = server.address();
      if (!address || typeof address !== 'object') {
        clearTimeout(timeout);
        server.close();
        resolve(null);
        return;
      }

      redirectUri = `http://localhost:${address.port}${REFERRAL_CALLBACK_PATH}`;

      const authorizationUrl = new URL(`${baseUrl}/api/oauth/authorize`);
      authorizationUrl.searchParams.set('client_id', appId);
      authorizationUrl.searchParams.set('redirect_uri', redirectUri);
      authorizationUrl.searchParams.set('response_type', 'code');
      authorizationUrl.searchParams.set('code_challenge', codeChallenge);
      authorizationUrl.searchParams.set('code_challenge_method', 'S256');
      authorizationUrl.searchParams.set('scope', 'llm:invoke offline_access');
      authorizationUrl.searchParams.set('state', oauthState);

      const opened = await openUrlInBrowser(authorizationUrl.toString());
      if (!opened) {
        log.warning(
          'Could not open your browser automatically. Open this URL to continue:'
        );
        log.message(authorizationUrl.toString());
      } else {
        log.message('Complete Echo authorization in your browser to continue.');
      }
    });
  });
}

async function exchangeAuthorizationCodeForToken({
  appId,
  code,
  codeVerifier,
  redirectUri,
  baseUrl,
}: AuthorizationCodeResult & {
  appId: string;
  baseUrl: string;
}): Promise<string | null> {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: appId,
    code,
    code_verifier: codeVerifier,
    redirect_uri: redirectUri,
  });

  const response = await fetch(`${baseUrl}/api/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'x-client-user-agent': process.env.npm_config_user_agent || 'echo-start',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    return null;
  }

  try {
    const parsed = (await response.json()) as { access_token?: string };
    return parsed.access_token || null;
  } catch {
    return null;
  }
}

async function registerTemplateReferralCode({
  appId,
  referralCode,
}: {
  appId: string;
  referralCode: string;
}): Promise<{ success: boolean; message: string }> {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    return {
      success: false,
      message:
        'Interactive browser authorization is required, but no TTY is available.',
    };
  }

  const baseUrl = resolveEchoBaseUrl();
  const authResult = await getAuthorizationCode({ appId, baseUrl });

  if (!authResult) {
    return {
      success: false,
      message:
        'Authorization did not complete. Referral registration was skipped.',
    };
  }

  const accessToken = await exchangeAuthorizationCodeForToken({
    ...authResult,
    appId,
    baseUrl,
  });

  if (!accessToken) {
    return {
      success: false,
      message: 'Could not exchange authorization code for an access token.',
    };
  }

  const response = await fetch(`${baseUrl}/api/v1/user/referral`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      echoAppId: appId,
      code: referralCode,
    }),
  });

  let payload: { success?: boolean; message?: string } | null = null;

  try {
    payload = (await response.json()) as {
      success?: boolean;
      message?: string;
    };
  } catch {
    payload = null;
  }

  if (response.ok && payload?.success) {
    return {
      success: true,
      message: payload.message || 'Referral code applied successfully.',
    };
  }

  return {
    success: false,
    message:
      payload?.message ||
      'Referral code could not be applied for this app and user.',
  };
}

function detectEnvVarName(projectPath: string): string | null {
  const envFiles = ['.env.local', '.env.example', '.env'];

  for (const fileName of envFiles) {
    const filePath = path.join(projectPath, fileName);
    if (existsSync(filePath)) {
      const content = readFileSync(filePath, 'utf-8');
      const match = content.match(
        /(NEXT_PUBLIC_|VITE_|REACT_APP_)?ECHO_APP_ID/
      );
      if (match) {
        return match[0];
      }
    }
  }

  return null;
}

function detectFrameworkEnvVarName(projectPath: string): string {
  const packageJsonPath = path.join(projectPath, 'package.json');

  if (existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      const deps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      if (deps['next']) {
        return 'NEXT_PUBLIC_ECHO_APP_ID';
      } else if (deps['vite']) {
        return 'VITE_ECHO_APP_ID';
      } else if (deps['react-scripts']) {
        return 'REACT_APP_ECHO_APP_ID';
      }
    } catch (e) {
      // Fall through to default
      console.error(e);
    }
  }

  return 'NEXT_PUBLIC_ECHO_APP_ID';
}

async function createApp(projectDir: string, options: CreateAppOptions) {
  let { template, appId } = options;
  const { skipInstall } = options;
  const packageManager = detectPackageManager();

  printHeader();

  intro('Creating your Echo application');

  // If no template specified, prompt for it
  if (!template) {
    const selectedTemplate = await select({
      message: 'Which template would you like to use?',
      options: Object.entries(DEFAULT_TEMPLATES).map(
        ([key, { title, description }]) => ({
          label: title,
          hint: description,
          value: key,
        })
      ),
    });

    if (isCancel(selectedTemplate)) {
      cancel('Operation cancelled.');
      process.exit(1);
    }

    template = selectedTemplate as string;
  }

  const isExternal = isExternalTemplate(template);

  if (isExternal) {
    log.step(`Using external template: ${template}`);
  } else {
    const templateName = template as TemplateName;
    log.step(`Selected template: ${DEFAULT_TEMPLATES[templateName].title}`);
  }

  // If no app ID specified, prompt for it
  if (!appId) {
    const enteredAppId = await text({
      message: 'What is your Echo App ID?',
      placeholder: 'Enter your app ID...',
      validate: (value: string) => {
        if (!value.trim()) {
          return 'Please enter an App ID or create one at https://echo.merit.systems/new';
        }
        return;
      },
    });

    if (isCancel(enteredAppId)) {
      cancel('Operation cancelled.');
      process.exit(1);
    }

    appId = enteredAppId;
  }

  log.step(`Using App ID: ${appId}`);

  const absoluteProjectPath = path.resolve(projectDir);

  // Check if directory already exists
  if (existsSync(absoluteProjectPath)) {
    cancel(`Directory "${projectDir}" already exists.`);
    process.exit(1);
  }

  try {
    const s = spinner();
    s.start('Downloading template files');

    let repoPath: string;

    if (isExternal) {
      repoPath = resolveTemplateRepo(template);
    } else {
      const templateConfig = DEFAULT_TEMPLATES[template as TemplateName];
      repoPath =
        'repo' in templateConfig
          ? `${templateConfig.repo}#production`
          : `Merit-Systems/echo/templates/${template}#production`;
    }

    const emitter = degit(repoPath);

    // Collect warnings to show after spinner
    const warnings: string[] = [];

    emitter.on('warn', warning => {
      warnings.push(warning.message);
    });

    try {
      await emitter.clone(absoluteProjectPath);
      s.stop('Template downloaded successfully');
    } catch (cloneError) {
      s.stop('Failed to download template');
      throw cloneError;
    }

    // Show any warnings that occurred
    if (warnings.length > 0) {
      warnings.forEach(msg => {
        log.warning(msg);
      });
    }

    // Verify that files were actually downloaded
    if (
      !existsSync(absoluteProjectPath) ||
      !existsSync(path.join(absoluteProjectPath, 'package.json'))
    ) {
      throw new Error(
        `Template download failed - no files found in ${absoluteProjectPath}`
      );
    }

    log.step('Configuring project files');

    // Update package.json with the name of the project
    const packageJsonPath = path.join(absoluteProjectPath, 'package.json');
    // Technically this is checked above, but good practice to check again
    if (existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      packageJson.name = toSafePackageName(projectDir);
      writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      log.message(
        `Updated package.json with project name: ${toSafePackageName(projectDir)}`
      );
    }

    // Update .env.local with the provided app ID
    const envPath = path.join(absoluteProjectPath, '.env.local');
    if (existsSync(envPath)) {
      try {
        const envContent = readFileSync(envPath, 'utf-8');

        // Replace the environment variable value - specifically targeting the *ECHO_APP_ID placeholder
        // Find the line with *ECHO_APP_ID and replace the value after the = sign
        const updatedContent = envContent.replace(
          /^(.*ECHO_APP_ID\s*=\s*).+$/gm,
          `$1${appId}`
        );

        // Check if the replacement actually occurred
        if (updatedContent === envContent) {
          log.warning('Could not find *ECHO_APP_ID placeholder in .env.local');
        } else {
          writeFileSync(envPath, updatedContent);
          log.message(`Updated ECHO_APP_ID in .env.local`);
        }
      } catch {
        log.warning('Could not update .env.local file');
      }
    } else if (isExternal) {
      const detectedVarName = detectEnvVarName(absoluteProjectPath);
      const envVarName =
        detectedVarName || detectFrameworkEnvVarName(absoluteProjectPath);
      const envContent = `${envVarName}=${appId}\n`;
      writeFileSync(envPath, envContent);
      log.message(`Created .env.local with ${envVarName}`);
    }

    if (isExternal) {
      const templateReferral = extractTemplateReferralCode(absoluteProjectPath);

      if (templateReferral.invalidCodeFound) {
        log.warning(
          `Found a referral code in ${templateReferral.sourcePath}, but it has an invalid format.`
        );
      } else if (templateReferral.referralCode) {
        log.step(
          `Registering template referral from ${templateReferral.sourcePath}`
        );
        const registration = await registerTemplateReferralCode({
          appId,
          referralCode: templateReferral.referralCode,
        });

        if (registration.success) {
          log.message(registration.message);
        } else {
          log.warning(
            `Could not auto-register template referral: ${registration.message}`
          );
        }
      }
    }

    log.step('Project setup completed successfully');

    // Auto-install dependencies unless skipped
    if (!skipInstall) {
      const s = spinner();
      s.start(`Installing dependencies with ${packageManager}...`);

      const installSuccess = await runInstall(
        packageManager,
        absoluteProjectPath,
        progressLine => {
          s.message(
            `Installing dependencies with ${packageManager}... ${chalk.gray(progressLine + '...')}`
          );
        }
      );

      if (installSuccess) {
        s.stop('Dependencies installed successfully');
      } else {
        s.stop('Failed to install dependencies');
        log.warning(
          `Could not install dependencies with ${packageManager}. Please run manually.`
        );
      }
    }

    const { install, dev } = getPackageManagerCommands(packageManager);
    const steps = skipInstall
      ? [`cd ${projectDir}`, install, dev]
      : [`cd ${projectDir}`, dev];

    const nextSteps =
      `${chalk.cyan('Get started:')}\n` +
      steps.map(step => `  ${chalk.cyan('└')} ${step}`).join('\n');

    outro(`Success! Created ${projectDir}\n\n${nextSteps}`);

    process.exit(0);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('could not find commit hash')) {
        if (isExternal) {
          cancel(
            `External template "${template}" not found.\n\nPlease verify the repository exists and is accessible.`
          );
        } else {
          cancel(
            `Template "${template}" not found in repository.\n\nThe template might not exist yet. Please check:\nhttps://github.com/Merit-Systems/echo/tree/master/templates`
          );
        }
      } else if (error.message.includes('Repository does not exist')) {
        if (isExternal) {
          cancel(
            `Repository "${template}" does not exist or is not accessible.\n\nPlease check the repository URL.`
          );
        } else {
          cancel(
            'Repository not accessible.\n\nMake sure you have access to the Merit-Systems/echo repository.'
          );
        }
      } else {
        cancel(`Failed to create app: ${error.message}`);
      }
    } else {
      cancel(`An unexpected error occurred: ${String(error)}`);
    }

    process.exit(1);
  }
}

async function main() {
  program
    .name('echo-start')
    .description('Create a new Echo application')
    .version(VERSION)
    .argument('[directory]', 'Directory to create the app in')
    .option(
      '-t, --template <template>',
      `Template to use. Can be a preset (${Object.keys(DEFAULT_TEMPLATES).join(', ')}) or a GitHub repository URL (https://github.com/user/repo)`
    )
    .option('-a, --app-id <appId>', 'Echo App ID to use in the project')
    .option('--skip-install', 'Skip automatic dependency installation')
    .action(
      async (directory: string | undefined, options: CreateAppOptions) => {
        let projectDir = directory;

        // If no directory specified, prompt for it
        if (!projectDir) {
          let defaultName = 'my-echo-app';
          let counter = 1;

          while (
            existsSync(path.resolve(defaultName)) &&
            readdirSync(path.resolve(defaultName)).length > 0
          ) {
            defaultName = `${defaultName}-${counter}`;
            counter++;
          }

          printHeader();

          intro('Creating your Echo application');

          const enteredProjectDir = await text({
            message: 'What is your project named?',
            placeholder: defaultName,
            defaultValue: defaultName,
            validate: (value: string) => {
              if (!value.trim()) {
                return 'Please enter a project name';
              }
              if (existsSync(path.resolve(value))) {
                return `Directory "${value}" already exists`;
              }
              return;
            },
          });

          if (isCancel(enteredProjectDir)) {
            cancel('Operation cancelled.');
            process.exit(1);
          }

          projectDir = enteredProjectDir;
          log.step(`Creating project: ${projectDir}`);
        }

        await createApp(projectDir, options);
      }
    );

  await program.parseAsync();
}

function toSafePackageName(dirname: string): string {
  return dirname
    .toLowerCase()
    .replace(/[^a-z0-9-_.]/g, '-') // replace unsafe chars with dashes
    .replace(/^-+/, '') // remove leading dashes
    .replace(/^_+/, '') // remove leading underscores
    .replace(/\.+$/, ''); // remove trailing dots
}

main().catch(error => {
  console.error(chalk.red('An unexpected error occurred:'));
  console.error(error);
  process.exit(1);
});
