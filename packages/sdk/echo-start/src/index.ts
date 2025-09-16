#!/usr/bin/env node

import chalk from 'chalk';
import { Command } from 'commander';
import degit from 'degit';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import ora from 'ora';
import path from 'path';
import prompts from 'prompts';

const program = new Command();

// Available templates - add new ones here
const DEFAULT_TEMPLATES = {
  'next-chat': {
    title: 'Next.js Chat',
    description:
      'Full-stack Next.js application with Echo and the Vercel AI SDK',
  },
  'react-chat': {
    title: 'React Chat',
    description: 'Vite React application with Echo and the Vercel AI SDK',
  },

  'next-image': {
    repo: 'Merit-Systems/echo/templates/next-image',
    title: 'Next.js Image Gen',
    description:
      'Full-stack Next.js application with Echo and the Vercel AI SDK for image generation',
  },
  'react-image': {
    repo: 'Merit-Systems/echo/templates/react-image',
    title: 'React Image Gen',
    description: 'Vite React application with Echo and the Vercel AI SDK',
  },
} as const;

type TemplateName = keyof typeof DEFAULT_TEMPLATES;

interface CreateAppOptions {
  template?: TemplateName;
  appId?: string;
}

async function createApp(projectDir: string, options: CreateAppOptions) {
  let { template, appId } = options;

  // If no template specified, prompt for it
  if (!template) {
    const response = await prompts({
      type: 'select',
      name: 'template',
      message: 'Which template would you like to use?',
      choices: Object.entries(DEFAULT_TEMPLATES).map(([key, template]) => ({
        title: template.title,
        description: template.description,
        value: key,
      })),
      initial: 0,
    });

    if (response.template) {
      template = response.template as TemplateName;
    } else {
      console.log(chalk.red('Aborted.'));
      process.exit(1);
    }
  }

  // If no app ID specified, prompt for it
  if (!appId) {
    const response = await prompts({
      type: 'text',
      name: 'appId',
      message: 'What is your Echo App ID?',
      validate: (value: string) => {
        if (!value.trim()) {
          return 'Please enter an App ID or create one at https://echo.merit.systems/new';
        }
        return true;
      },
    });

    if (response.appId) {
      appId = response.appId;
    } else {
      console.log(chalk.red('Aborted.'));
      process.exit(1);
    }
  }

  // Validate template exists
  if (!template) {
    console.error(chalk.red(`Template "${template}" does not exist.`));
    console.log(chalk.gray('Available templates:'));
    Object.keys(DEFAULT_TEMPLATES).forEach(t => {
      console.log(chalk.gray(`  - ${t}`));
    });
    process.exit(1);
  }

  const absoluteProjectPath = path.resolve(projectDir);

  // Check if directory already exists
  if (existsSync(absoluteProjectPath)) {
    console.error(chalk.red(`Directory "${projectDir}" already exists.`));
    process.exit(1);
  }

  try {
    const spinner = ora(`Downloading template: ${template}`).start();

    // Use degit to download the template
    const emitter = degit(
      `Merit-Systems/echo/templates/${template}#production`
    );

    // Collect warnings to show after spinner
    const warnings: string[] = [];

    emitter.on('warn', warning => {
      warnings.push(warning.message);
    });

    try {
      await emitter.clone(absoluteProjectPath);
      spinner.succeed('Template downloaded successfully');
    } catch (cloneError) {
      spinner.fail('Failed to download template');
      throw cloneError;
    }

    // Show any warnings that occurred
    if (warnings.length > 0) {
      warnings.forEach(msg => {
        console.log(chalk.yellow(`  Warning: ${msg}`));
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

    // Update package.json with the name of the project
    const packageJsonPath = path.join(absoluteProjectPath, 'package.json');
    // Technically this is checked above, but good practice to check again
    if (existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      packageJson.name = toSafePackageName(projectDir);
      writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log(chalk.green(`✓ Updated package.json with project name`));
    }

    // Update .env.local with the provided app ID
    const envPath = path.join(absoluteProjectPath, '.env.local');
    if (existsSync(envPath)) {
      try {
        const envContent = readFileSync(envPath, 'utf-8');

        // Replace the environment variable value - specifically targeting the *_ECHO_APP_ID placeholder
        // Find the line with *_ECHO_APP_ID and replace the value after the = sign
        const updatedContent = envContent.replace(
          /^(.+ECHO_APP_ID\s*=\s*).+$/m,
          `$1${appId!}`
        );

        // Check if the replacement actually occurred
        if (updatedContent === envContent) {
          console.error(
            chalk.red(
              'Error: Could not find *ECHO_APP_ID placeholder in .env.local.'
            )
          );
        }

        writeFileSync(envPath, updatedContent);
        console.log(chalk.green(`✓ Updated *ECHO_APP_ID in .env.local`));
      } catch (envError) {
        console.log(
          chalk.yellow(`Warning: Could not update .env.local file`),
          envError
        );
      }
    }

    console.log();
    console.log(chalk.blue.bold('✓ Initialization completed'));
    console.log();

    // Instructions for next steps
    console.log(chalk.cyan.bold('Next steps:'));
    console.log(chalk.gray(`▶ cd ${projectDir}`));
    console.log(chalk.gray(`▶ pnpm install`));
    console.log(chalk.gray(`▶ pnpm dev`));

    process.exit(0);
  } catch (error) {
    console.log();
    console.error(chalk.red('✗ Failed to create app'));
    console.log();

    if (error instanceof Error) {
      if (error.message.includes('could not find commit hash')) {
        console.error(chalk.red('Template repository or path not found.'));
        console.error(
          chalk.gray(
            `The template "${template}" might not exist in the repository yet.`
          )
        );
        console.error(
          chalk.gray(
            'Please check that the example exists in the echo monorepo.'
          )
        );
      } else if (error.message.includes('Repository does not exist')) {
        console.error(chalk.red('Repository not accessible.'));
        console.error(
          chalk.gray(
            'Make sure you have access to the Merit-Systems/echo repository.'
          )
        );
      } else {
        console.error(chalk.red(`Error: ${error.message}`));
      }
    } else {
      console.error(chalk.red(`Unknown error: ${String(error)}`));
    }

    console.log();
    console.error(chalk.gray('Troubleshooting:'));
    console.error(
      chalk.gray(
        '- Verify the template exists in https://github.com/Merit-Systems/echo/tree/master/templates directory'
      )
    );
    console.error(chalk.gray('- Check your internet connection'));
    console.error(chalk.gray('- Try again in a few moments'));

    process.exit(1);
  }
}

async function main() {
  program
    .name('echo-start')
    .description('Create a new Echo application')
    .version(require('../package.json').version)
    .argument('[directory]', 'Directory to create the app in')
    .option(
      '-t, --template <template>',
      `Template to use (${Object.keys(DEFAULT_TEMPLATES).join(', ')})`
    )
    .option('-a, --app-id <appId>', 'Echo App ID to use in the project')
    .action(
      async (directory: string | undefined, options: CreateAppOptions) => {
        let projectDir = directory;

        // If no directory specified, prompt for it
        if (!projectDir) {
          const response = await prompts({
            type: 'text',
            name: 'projectDir',
            message: 'What is your project named?',
            initial: 'my-echo-app',
            validate: (value: string) => {
              if (!value.trim()) {
                return 'Please enter a project name';
              }
              if (existsSync(path.resolve(value))) {
                return `Directory "${value}" already exists`;
              }
              return true;
            },
          });

          if (response.projectDir) {
            projectDir = response.projectDir;
          } else {
            console.log(chalk.red('Aborted.'));
            process.exit(1);
          }
        }

        await createApp(projectDir!, options);
      }
    );

  await program.parseAsync();
}

function toSafePackageName(dirname: string) {
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
