#!/usr/bin/env node

/**
 * Script to publish packages with dynamic authToken
 * Usage:
 *   - Create .env file with NPM_AUTH_TOKEN=your_token and run: pnpm release-packages
 *   - NPM_TOKEN=your_token pnpm release-packages
 *   - pnpm release-packages -- your_token
 *   - node scripts/publish-with-token.js [authToken]
 *
 * Token resolution priority:
 *   1. Command line argument (highest priority)
 *   2. NPM_TOKEN environment variable
 *   3. NPM_AUTH_TOKEN from .env file (lowest priority)
 */

import { execSync } from 'child_process';
import { existsSync, writeFileSync, readFileSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

/**
 * Load environment variables from .env file
 * Simple parser without external dependencies
 */
function loadEnvFile(envPath) {
  const env = {};

  if (!existsSync(envPath)) {
    return env;
  }

  try {
    const content = readFileSync(envPath, 'utf-8');
    const lines = content.split('\n');

    for (const line of lines) {
      // Skip empty lines and comments
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      // Parse KEY=VALUE format
      const match = trimmed.match(/^([^#=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();

        // Remove quotes if present
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }

        env[key] = value;
      }
    }
  } catch (error) {
    // Silently ignore .env file read errors
    console.warn(`⚠️  Warning: Could not read .env file: ${error.message}`);
  }

  return env;
}

// Load .env file from root directory
const envPath = join(rootDir, '.env');
const envVars = loadEnvFile(envPath);

// Get authToken with priority: command line > environment variable > .env file
let authToken = null;

// 1. Check command line arguments (highest priority)
const args = process.argv
  .slice(2)
  .filter((arg) => arg !== '--' && arg !== '--help' && !arg.startsWith('-'));
if (args.length > 0 && args[0] && !args[0].startsWith('-')) {
  authToken = args[0];
}

// 2. Check environment variable (NPM_TOKEN)
if (!authToken) {
  authToken = process.env.NPM_TOKEN;
}

// 3. Check .env file (NPM_AUTH_TOKEN)
if (!authToken) {
  authToken = envVars.NPM_AUTH_TOKEN || envVars.NPM_TOKEN;
}

if (!authToken) {
  console.error('❌ Error: NPM authToken is required');
  console.error('');
  console.error('Token resolution priority:');
  console.error('  1. Command line argument');
  console.error('  2. NPM_TOKEN environment variable');
  console.error('  3. NPM_AUTH_TOKEN from .env file');
  console.error('');
  console.error('Usage:');
  console.error('  1. Create .env file in root directory:');
  console.error('     echo "NPM_AUTH_TOKEN=your_token" > .env');
  console.error('     pnpm release-packages');
  console.error('');
  console.error('  2. Using environment variable:');
  console.error('     NPM_TOKEN=your_token pnpm release-packages');
  console.error('');
  console.error('  3. Passing token as argument:');
  console.error('     pnpm release-packages -- your_token');
  console.error('');
  console.error('  4. Direct script call:');
  console.error('     node scripts/publish-with-token.js your_token');
  process.exit(1);
}

// Log token source for debugging (without exposing the token)
const tokenSource =
  args.length > 0
    ? 'command line argument'
    : process.env.NPM_TOKEN
      ? 'environment variable (NPM_TOKEN)'
      : 'environment file (.env)';
console.log(`🔑 Using authToken from: ${tokenSource}`);

const npmrcPath = join(rootDir, '.npmrc');
const originalNpmrc = existsSync(npmrcPath) ? readFileSync(npmrcPath, 'utf-8') : null;

try {
  // Read existing .npmrc or create new content
  let npmrcContent = originalNpmrc || '';

  // Remove existing authToken line if present
  npmrcContent = npmrcContent
    .split('\n')
    .filter((line) => !line.includes('//registry.npmjs.org/:_authToken='))
    .join('\n')
    .trim();

  // Add authToken line
  const authTokenLine = `//registry.npmjs.org/:_authToken=${authToken}`;

  // Ensure there's a newline at the end if there's existing content
  if (npmrcContent && !npmrcContent.endsWith('\n')) {
    npmrcContent += '\n';
  }

  npmrcContent += authTokenLine + '\n';

  // Write temporary .npmrc
  writeFileSync(npmrcPath, npmrcContent, 'utf-8');

  console.log('✅ NPM authToken configured temporarily');
  console.log('📦 Publishing packages with changesets...\n');

  // Run changeset publish
  execSync('pnpm changeset publish', {
    cwd: rootDir,
    stdio: 'inherit',
  });

  console.log('\n✅ Packages published successfully');
} catch (error) {
  console.error('\n❌ Error publishing packages:', error.message);
  process.exit(1);
} finally {
  // Restore original .npmrc (always clean up authToken)
  try {
    if (originalNpmrc !== null) {
      // Restore original content (it should not have authToken)
      writeFileSync(npmrcPath, originalNpmrc, 'utf-8');
    } else if (existsSync(npmrcPath)) {
      // If .npmrc didn't exist before, remove authToken line
      const currentContent = readFileSync(npmrcPath, 'utf-8');
      const cleanedContent = currentContent
        .split('\n')
        .filter((line) => !line.includes('//registry.npmjs.org/:_authToken='))
        .join('\n')
        .trim();

      if (cleanedContent) {
        writeFileSync(npmrcPath, cleanedContent + '\n', 'utf-8');
      } else {
        // If only authToken line exists, remove the file entirely
        unlinkSync(npmrcPath);
      }
    }

    console.log('🔒 Restored original .npmrc configuration');
  } catch (cleanupError) {
    console.error('⚠️  Warning: Failed to restore .npmrc:', cleanupError.message);
    // Try to remove authToken line as a fallback
    try {
      if (existsSync(npmrcPath)) {
        const currentContent = readFileSync(npmrcPath, 'utf-8');
        const cleanedContent = currentContent
          .split('\n')
          .filter((line) => !line.includes('//registry.npmjs.org/:_authToken='))
          .join('\n')
          .trim();
        if (cleanedContent) {
          writeFileSync(npmrcPath, cleanedContent + '\n', 'utf-8');
        }
      }
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}
