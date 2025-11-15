#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { generateTailwindConfig } = require('../dist/index.cjs');

function showHelp() {
  console.log(`
Usage: tailwind-theme [options]

Options:
  -i, --input <path>     Path to variables.json file (default: ./theme/variables.json)
  -c, --component <path>  Path to component variables.json file (optional)
  -o, --output <path>    Output path for tailwind.config.js (default: ./tailwind.config.js)
  -h, --help             Show this help message

Examples:
  tailwind-theme
  tailwind-theme -i ./custom-variables.json -o ./tailwind.config.js
  tailwind-theme -i ./variables.json -c ./components.json -o ./tailwind.config.js
`);
}

function main() {
  const args = process.argv.slice(2);
  let inputPath = path.join(process.cwd(), 'theme', 'variables.json');
  let componentPath = null;
  let outputPath = path.join(process.cwd(), 'tailwind.config.js');

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '-h':
      case '--help':
        showHelp();
        process.exit(0);
        break;
      case '-i':
      case '--input':
        if (i + 1 < args.length) {
          inputPath = path.resolve(process.cwd(), args[++i]);
        } else {
          console.error('Error: --input requires a path argument');
          process.exit(1);
        }
        break;
      case '-c':
      case '--component':
        if (i + 1 < args.length) {
          componentPath = path.resolve(process.cwd(), args[++i]);
        } else {
          console.error('Error: --component requires a path argument');
          process.exit(1);
        }
        break;
      case '-o':
      case '--output':
        if (i + 1 < args.length) {
          outputPath = path.resolve(process.cwd(), args[++i]);
        } else {
          console.error('Error: --output requires a path argument');
          process.exit(1);
        }
        break;
      default:
        console.error(`Unknown option: ${arg}`);
        showHelp();
        process.exit(1);
    }
  }

  // Check if input file exists
  if (!fs.existsSync(inputPath)) {
    console.error(`Error: Input file not found: ${inputPath}`);
    process.exit(1);
  }

  // Read variables
  let variables;
  try {
    const content = fs.readFileSync(inputPath, 'utf-8');
    variables = JSON.parse(content);
  } catch (error) {
    console.error(`Error reading variables file: ${error.message}`);
    process.exit(1);
  }

  // Read component variables if provided
  let componentVariables = null;
  if (componentPath) {
    if (!fs.existsSync(componentPath)) {
      console.error(`Error: Component file not found: ${componentPath}`);
      process.exit(1);
    }
    try {
      const content = fs.readFileSync(componentPath, 'utf-8');
      componentVariables = JSON.parse(content);
    } catch (error) {
      console.error(`Error reading component file: ${error.message}`);
      process.exit(1);
    }
  }

  // Generate Tailwind config
  try {
    const config = generateTailwindConfig(variables, componentVariables);

    // Format the config as a JavaScript module
    // Convert JSON to JS format (remove quotes from keys)
    let configString = JSON.stringify(config, null, 2);
    // Replace quoted keys with unquoted keys (for valid JS, but preserve string keys)
    configString = configString.replace(/"([a-zA-Z_][a-zA-Z0-9_]*)":/g, '$1:');
    // Fix content array to use single quotes for strings
    configString = configString.replace(/content:\s*\[(.*?)\]/gs, (match, content) => {
      const items = content.split(',').map(s => {
        const trimmed = s.trim().replace(/^"|"$/g, '');
        return `'${trimmed}'`;
      });
      return `content: [${items.join(', ')}]`;
    });

    const finalConfig = `/** @type {import('tailwindcss').Config} */
export default ${configString};
`;

    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write config file
    fs.writeFileSync(outputPath, finalConfig, 'utf-8');
    console.log(`✓ Tailwind config generated successfully: ${outputPath}`);
  } catch (error) {
    console.error(`Error generating Tailwind config: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

main();

