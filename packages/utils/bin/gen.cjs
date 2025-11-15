#!/usr/bin/env node

/**
 * CLI entry point for generate-api script
 * Usage: gen --output-dirs=key1:path1,key2:path2 [--project=type]
 */

const path = require('path');
const { spawn } = require('child_process');

// Show help message
function showHelp() {
  console.log(`
Usage: gen [options]

Generate API client code from swagger.json

Options:
  --output-dirs=<key:path>[,<key:path>...]  Specify output directories
                                            Format: key1:path1,key2:path2
                                            Example: --output-dirs=app:./src/apis
                                            Example: --output-dirs=app:./src/apis,operation:./src/ops

  --project=<type>                          Project type (for backward compatibility)
                                            Supported types: app, operation
                                            Example: --project=app

  -h, --help                                Show this help message

Examples:
  # Generate API code to a single directory
  gen --output-dirs=app:./src/lib/apis

  # Generate API code to multiple directories
  gen --output-dirs=app:./apps/lago-app/src/lib/apis,operation:./apps/lago-operation/src/lib/apis

  # Use project type (backward compatible, uses default paths)
  gen --project=app

Notes:
  - The script requires swagger.json to be present in the current working directory (process.cwd())
  - All API responses in swagger.json must wrap the response data in a "data" property
  - Output directories will be created automatically if they don't exist
  - When using --output-dirs with a single directory, the key is optional
  - Your tsconfig.json must include: experimentalDecorators, emitDecoratorMetadata, useDefineForClassFields, strictPropertyInitialization: false
`);
}

// Get the path to the actual generate-api.js script
const scriptPath = path.join(__dirname, '../scripts/generate-api.cjs');

// Forward all command line arguments
const args = process.argv.slice(2);

// Check for help flag
if (args.includes('--help') || args.includes('-h')) {
  showHelp();
  process.exit(0);
}

// Spawn the actual script
const child = spawn('node', [scriptPath, ...args], {
  stdio: 'inherit',
  cwd: process.cwd(),
});

child.on('error', (error) => {
  console.error(`Error running generate-api: ${error.message}`);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
