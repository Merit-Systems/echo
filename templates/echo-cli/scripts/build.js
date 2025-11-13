import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Load environment variables from .env.local
dotenv.config({ path: join(rootDir, '.env.local') });

const ECHO_APP_ID = process.env.ECHO_APP_ID;

if (!ECHO_APP_ID) {
  console.error('Error: ECHO_APP_ID not found in .env.local');
  process.exit(1);
}

const constantsPath = join(rootDir, 'src', 'constants.ts');

// Read the original file
const originalContent = readFileSync(constantsPath, 'utf8');

// Replace process.env.ECHO_APP_ID with the actual value
const modifiedContent = originalContent.replace(
  /export const ECHO_APP_ID = process\.env\.ECHO_APP_ID!;/,
  `export const ECHO_APP_ID = '${ECHO_APP_ID}';`
);

try {
  // Write modified content
  writeFileSync(constantsPath, modifiedContent, 'utf8');
  console.log('Building with ECHO_APP_ID:', ECHO_APP_ID);

  // Run TypeScript compiler
  execSync('tsc', { stdio: 'inherit', cwd: rootDir });

  console.log('Build completed successfully!');
} finally {
  // Always restore the original file
  writeFileSync(constantsPath, originalContent, 'utf8');
  console.log('Restored original constants.ts');
}

