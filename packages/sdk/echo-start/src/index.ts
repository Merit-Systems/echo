#!/usr/bin/env node

import {
  intro,
  outro,
  select,
  text,
  confirm,
  spinner,
  log,
  isCancel,
  cancel,
} from '@clack/prompts';
import chalk from 'chalk';
import { Command } from 'commander';
import degit from 'degit';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { readFile } from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';

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
  authjs: {
    title: 'Auth.js (NextAuth)',
    description:
      'Next.js application with Echo as an Auth.js provider for authentication',
  },
} as const;

type TemplateName = keyof typeof DEFAULT_TEMPLATES;
type PackageManager = 'pnpm' | 'npm' | 'yarn' | 'bun';

const ECHO_BASE_URL =
  (typeof process !== 'undefined' && process.env?.ECHO_BASE_URL) ||
  'https://echo.merit.systems';

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

async function extractReferralCodeFromTemplate(
  templatePath: string
): Promise<string | null> {
  const configFile = path.join(templatePath, 'echo.config.json');

  if (!existsSync(configFile)) {
    return null;
  }

  try {
    const content = await readFile(configFile, 'utf-8');
    const config = JSON.parse(content);
    return config.referralCode || config.echo?.referralCode || null;
  } catch {
    return null;
  }
}

async function registerTemplateReferral(
  appId: string,
  templatePath: string,
  apiKey: string
): Promise<void> {
  try {
    const referralCode = await extractReferralCodeFromTemplate(templatePath);

    if (!referralCode) {
      log.info('No referral code found in template echo.config.json');
      return;
    }

    log.step(`Found template referral code, applying...`);

    const response = await fetch(`${ECHO_BASE_URL}/api/v1/user/referral`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        echoAppId: appId,
        code: referralCode,
      }),
    });

    if (!response.ok) {
      const errorData = (await response.json()) as { message?: string };
      log.warn(
        `Referral code could not be applied: ${errorData.message || 'Unknown error'}`
      );
      return;
    }

    const result = (await response.json()) as { success?: boolean };
    if (result.success) {
      log.success('Template referral code applied successfully');
    }
  } catch (error) {
    log.warn(
      `Referral registration error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
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

    if (isExternal) {
      const referralCode = await extractReferralCodeFromTemplate(
        absoluteProjectPath
      );

      if (referralCode) {
        const shouldApplyReferral = await confirm({
          message: 'This template includes a referral code. Apply it?',
          initialValue: true,
        });

        if (!isCancel(shouldApplyReferral) && shouldApplyReferral) {
          const apiKey = await text({
            message: 'Enter your Echo API key:',
            placeholder: 'Your API key from https://echo.merit.systems/keys',
            validate: (value: string) => {
              if (!value.trim()) {
                return 'API key is required to apply referral code';
              }
              return;
            },
          });

          if (!isCancel(apiKey)) {
            await registerTemplateReferral(appId, absoluteProjectPath, apiKey);
          }
        }
      }
    }

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
