#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');
const { camelCase, upperFirst } = require('lodash');

const symbolExpReg =
  /<(symbol) id="(pintu-)?icon-([^"]+)" viewBox="0 0 1024 1024">((?:(?!<\/\1>).|\n)*?)<\/\1>/g;

function showHelp() {
  console.log(`
Usage: gen-icons [options] <iconfontUrl1> [iconfontUrl2] ...

Options:
  -o, --output <path>    Output directory (default: ./src/icons)
  -h, --help             Show this help message

Examples:
  gen-icons https://at.alicdn.com/t/font_8d5l8fzk5b87iudi.js
  gen-icons -o ./icons https://at.alicdn.com/t/font_8d5l8fzk5b87iudi.js
  gen-icons https://at.alicdn.com/t/c/font_1.js https://at.alicdn.com/t/c/font_2.js
`);
}

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        res.setEncoding('utf-8');
        let rawData = '';
        res.on('data', (chunk) => (rawData += chunk));
        res.on('end', () => resolve(rawData));
      })
      .on('error', reject);
  });
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function formatComponent(name, iconContent) {
  // Convert kebab-case attributes to camelCase
  const processedContent = iconContent.replace(
    /([-\w]+)=/g,
    ($0, $1) => `${camelCase($1)}=`
  );

  return `import React from 'react';
import Icon, { IconBaseProps } from './BaseIcon';

export interface ${name}Props extends Omit<IconBaseProps, 'icon'> {}

export default function ${name}(props: ${name}Props) {
  return <Icon {...props} icon={<>${processedContent}</>} />;
}
`;
}

function formatBaseIcon() {
  return `import React from 'react';

export interface IconBaseProps extends React.HTMLProps<HTMLSpanElement> {
  className?: string;
  style?: React.CSSProperties;
  type?: string;
  icon?: React.ReactNode | ((props: IconBaseProps) => React.ReactNode);
  onClick?: React.MouseEventHandler<HTMLSpanElement>;
  spin?: boolean;
  rotate?: number;
}

export default function Icon(props: IconBaseProps) {
  const {
    className,
    type,
    icon,
    onClick,
    style,
    spin,
    rotate,
    ...restProps
  } = props;

  const svgStyle = {
    transform: rotate ? \`rotate(\${rotate}deg)\` : undefined,
    ...style,
  };

  const svgProps = {
    className: spin ? 'animate-spin' : undefined,
    style: svgStyle,
    viewBox: '0 0 1024 1024',
    'data-icon': type,
    width: '1em',
    height: '1em',
    fill: 'currentColor',
    'aria-hidden': 'true',
  };

  const renderIcon = () => {
    if (typeof icon === 'function') {
      return icon(props);
    }
    return icon;
  };

  return (
    <span
      className={\`inline-block text-inherit not-italic leading-none text-center normal-case -mt-0.5 align-middle antialiased \${
        onClick ? 'cursor-pointer' : ''
      } \${className || ''}\`}
      onClick={onClick}
      {...restProps}
    >
      <svg {...svgProps} className="inline-block">
        {renderIcon()}
      </svg>
    </span>
  );
}
`;
}

async function generateIcons(iconUrls, outputDir) {
  ensureDir(outputDir);

  // Write BaseIcon
  const baseIconPath = path.join(outputDir, 'BaseIcon.tsx');
  fs.writeFileSync(baseIconPath, formatBaseIcon(), 'utf-8');

  const allNames = ['BaseIcon'];
  const allIcons = new Map(); // Map to deduplicate icons by name

  // Fetch and parse all icon URLs
  for (const iconUrl of iconUrls) {
    console.log(`Fetching icons from: ${iconUrl}`);
    try {
      const content = await fetchUrl(iconUrl);

      // Extract SVG string if needed
      let svgContent = content;
      const svgMatch = content.match(
        /window\._iconfont_svg_string_\d+='(<svg>.*?<\/svg>)'/
      );
      if (svgMatch) {
        svgContent = svgMatch[1];
      }

      let match = symbolExpReg.exec(svgContent);
      while (match) {
        const iconName = match[3];
        const iconId = match[2] ? `pintu-icon-${iconName}` : `icon-${iconName}`;
        const componentName = `${upperFirst(camelCase(iconName))}Icon`;
        const iconContent = match[4];

        // Use the last icon if duplicate
        if (!allIcons.has(componentName)) {
          allIcons.set(componentName, {
            name: componentName,
            content: iconContent,
            id: iconId,
          });
          allNames.push(componentName);
        } else {
          // Update with latest
          allIcons.set(componentName, {
            name: componentName,
            content: iconContent,
            id: iconId,
          });
        }

        match = symbolExpReg.exec(svgContent);
      }
    } catch (error) {
      console.error(`Error fetching ${iconUrl}:`, error.message);
    }
  }

  // Write individual icon components
  for (const [componentName, icon] of allIcons) {
    const componentPath = path.join(outputDir, `${componentName}.tsx`);
    fs.writeFileSync(
      componentPath,
      formatComponent(componentName, icon.content),
      'utf-8'
    );
  }

  // Write index file
  const indexContent = allNames
    .sort()
    .map((name) => `export { default as ${name} } from './${name}';`)
    .join('\n');

  const indexPath = path.join(outputDir, 'index.ts');
  fs.writeFileSync(indexPath, indexContent, 'utf-8');

  console.log(`\n✓ Generated ${allIcons.size} icons in ${outputDir}`);
  console.log(`✓ Total components: ${allNames.length}`);
}

function main() {
  const args = process.argv.slice(2);
  let outputDir = path.join(process.cwd(), 'src', 'icons');
  const iconUrls = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '-h':
      case '--help':
        showHelp();
        process.exit(0);
        break;
      case '-o':
      case '--output':
        if (i + 1 < args.length) {
          outputDir = path.resolve(process.cwd(), args[++i]);
        } else {
          console.error('Error: --output requires a path argument');
          process.exit(1);
        }
        break;
      default:
        if (arg.startsWith('http')) {
          iconUrls.push(arg);
        } else {
          console.error(`Unknown option or invalid URL: ${arg}`);
          showHelp();
          process.exit(1);
        }
    }
  }

  if (iconUrls.length === 0) {
    console.error('Error: No iconfont URLs provided');
    showHelp();
    process.exit(1);
  }

  generateIcons(iconUrls, outputDir).catch((error) => {
    console.error('Error generating icons:', error);
    process.exit(1);
  });
}

main();

