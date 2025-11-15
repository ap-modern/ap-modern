/* eslint-disable @typescript-eslint/no-explicit-any */
import { formatValues } from './variableResolver';

type VariableMap = Record<string, any>;
type TailwindConfig = {
  content: string[];
  theme: {
    extend: {
      colors: Record<string, string | Record<string, string>>;
      fontSize: Record<string, string>;
      fontWeight: Record<string, number>;
      spacing: Record<string, string>;
      borderRadius: Record<string, string>;
      boxShadow: Record<string, string>;
      borderWidth: Record<string, string>;
      lineHeight: Record<string, number>;
      [key: string]: any;
    };
  };
  plugins: any[];
};

/**
 * Convert kebab-case to camelCase
 */
function kebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

/**
 * Convert px values to Tailwind format
 */
function normalizeSize(value: string | number): string {
  if (typeof value === 'number') {
    return `${value}px`;
  }
  if (typeof value === 'string' && /^\d+$/.test(value)) {
    return `${value}px`;
  }
  return value;
}

/**
 * Resolve color references like "brand-6" to actual color values
 */
function resolveColorReference(value: string, resolved: VariableMap): string {
  // If it's already a hex color or rgba, return as is
  if (value.startsWith('#') || value.startsWith('rgba') || value.startsWith('rgb')) {
    return value;
  }

  // Check if it's a color palette reference (e.g., "brand-6")
  const parts = value.split('-');
  if (parts.length === 2) {
    const [palette, index] = parts;
    const paletteData = resolved[palette] as VariableMap | undefined;
    if (paletteData && paletteData[index]) {
      const colorValue = paletteData[index];
      if (typeof colorValue === 'string') {
        // If the resolved value is still a reference, resolve it again
        if (
          !colorValue.startsWith('#') &&
          !colorValue.startsWith('rgba') &&
          !colorValue.startsWith('rgb')
        ) {
          return resolveColorReference(colorValue, resolved);
        }
        return colorValue;
      }
    }
  }

  // Check if it's a direct reference in resolved
  if (resolved[value] && typeof resolved[value] === 'string') {
    const refValue = resolved[value];
    if (refValue.startsWith('#') || refValue.startsWith('rgba') || refValue.startsWith('rgb')) {
      return refValue;
    }
    // Recursively resolve
    return resolveColorReference(refValue, resolved);
  }

  // Return as is if can't resolve
  return value;
}

/**
 * Generate Tailwind config from variables
 */
export function generateTailwindConfig(
  variables: VariableMap,
  componentVariables?: VariableMap
): TailwindConfig {
  const resolved = formatValues(variables, {}, true);

  const config: TailwindConfig = {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
      extend: {
        colors: {},
        fontSize: {},
        fontWeight: {},
        spacing: {},
        borderRadius: {},
        boxShadow: {},
        borderWidth: {},
        lineHeight: {},
      },
    },
    plugins: [],
  };

  // Process global colors
  if (resolved.global) {
    const global = resolved.global as VariableMap;
    Object.entries(global).forEach(([key, value]) => {
      if (typeof value === 'string') {
        config.theme.extend.colors[kebabToCamel(key)] = value;
      }
    });
  }

  // Process color palettes (brand, black, success, error, warning, white)
  const colorPalettes = ['brand', 'black', 'success', 'error', 'warning', 'white'];
  colorPalettes.forEach((palette) => {
    if (resolved[palette]) {
      const paletteColors: Record<string, string> = {};
      const paletteData = resolved[palette] as VariableMap;
      Object.entries(paletteData).forEach(([key, value]) => {
        if (typeof value === 'string') {
          // Colors in palette should already be resolved, but double-check
          const colorValue = resolveColorReference(value, resolved);
          paletteColors[key] = colorValue;
        }
      });
      if (Object.keys(paletteColors).length > 0) {
        config.theme.extend.colors[palette] = paletteColors;
      }
    }
  });

  // Process text colors
  if (resolved.text?.['!color']) {
    const textColors = resolved.text['!color'] as VariableMap;
    Object.entries(textColors).forEach(([key, value]) => {
      if (typeof value === 'string') {
        const colorValue = resolveColorReference(value, resolved);
        config.theme.extend.colors[`text-${kebabToCamel(key)}`] = colorValue;
      }
    });
  }

  // Process global colors
  if (resolved['!color']) {
    const globalColors = resolved['!color'] as VariableMap;
    Object.entries(globalColors).forEach(([key, value]) => {
      if (typeof value === 'string') {
        // Resolve color references (e.g., "brand-6" -> actual color value)
        const colorValue = resolveColorReference(value, resolved);
        config.theme.extend.colors[kebabToCamel(key)] = colorValue;
      }
    });
  }

  // Process box body colors
  if (resolved.box?.body?.['!color']) {
    const bodyColors = resolved.box.body['!color'] as VariableMap;
    Object.entries(bodyColors).forEach(([key, value]) => {
      if (typeof value === 'string') {
        const colorValue = resolveColorReference(value, resolved);
        config.theme.extend.colors[`box-body-${kebabToCamel(key)}`] = colorValue;
      }
    });
  }

  // Process text sizes
  if (resolved.text?.['!size:px']) {
    const textSizes = resolved.text['!size:px'] as VariableMap;
    Object.entries(textSizes).forEach(([key, value]) => {
      if (typeof value === 'number' || typeof value === 'string') {
        config.theme.extend.fontSize[`text-${key}`] = normalizeSize(value);
      }
    });
  }

  // Process text weights
  if (resolved.text?.['!weight']) {
    const textWeights = resolved.text['!weight'] as VariableMap;
    Object.entries(textWeights).forEach(([key, value]) => {
      if (typeof value === 'number') {
        config.theme.extend.fontWeight[`text-${key}`] = value;
      }
    });
  }

  // Process line height
  if (resolved.text?.line?.height) {
    config.theme.extend.lineHeight['text'] = resolved.text.line.height as number;
  }

  // Process box spacing (padding, margin)
  if (resolved.box?.padding) {
    const padding = resolved.box.padding as VariableMap;
    Object.entries(padding).forEach(([key, value]) => {
      if (key.startsWith('!size:px') || key.startsWith('!vsize:px')) {
        const sizes = value as VariableMap;
        Object.entries(sizes).forEach(([sizeKey, sizeValue]) => {
          if (typeof sizeValue === 'number' || typeof sizeValue === 'string') {
            const spacingKey = `box-padding-${sizeKey}`;
            config.theme.extend.spacing[spacingKey] = normalizeSize(sizeValue);
          }
        });
      }
    });
  }

  if (resolved.box?.margin) {
    const margin = resolved.box.margin as VariableMap;
    Object.entries(margin).forEach(([key, value]) => {
      if (key.startsWith('!size:px') || key.startsWith('!vsize:px')) {
        const sizes = value as VariableMap;
        Object.entries(sizes).forEach(([sizeKey, sizeValue]) => {
          if (typeof sizeValue === 'number' || typeof sizeValue === 'string') {
            const spacingKey = `box-margin-${sizeKey}`;
            config.theme.extend.spacing[spacingKey] = normalizeSize(sizeValue);
          }
        });
      }
    });
  }

  // Process box heights and widths
  if (resolved.box?.height?.['!size:px']) {
    const heights = resolved.box.height['!size:px'] as VariableMap;
    Object.entries(heights).forEach(([key, value]) => {
      if (typeof value === 'number' || typeof value === 'string') {
        config.theme.extend.spacing[`box-height-${key}`] = normalizeSize(value);
      }
    });
  }

  if (resolved.box?.width?.['!size:px']) {
    const widths = resolved.box.width['!size:px'] as VariableMap;
    Object.entries(widths).forEach(([key, value]) => {
      if (typeof value === 'number' || typeof value === 'string') {
        config.theme.extend.spacing[`box-width-${key}`] = normalizeSize(value);
      }
    });
  }

  // Process border radius
  if (resolved.box?.border) {
    const border = resolved.box.border as VariableMap;
    // Check for radius:px format
    if (border['radius:px']) {
      const radius = border['radius:px'];
      if (typeof radius === 'number' || typeof radius === 'string') {
        config.theme.extend.borderRadius['box'] = normalizeSize(radius);
      }
    } else if (border.radius) {
      const radius = border.radius;
      if (typeof radius === 'number' || typeof radius === 'string') {
        config.theme.extend.borderRadius['box'] = normalizeSize(radius);
      }
    }
  }

  // Process border width
  if (resolved.box?.border?.['!width']) {
    const widths = resolved.box.border['!width'] as VariableMap;
    Object.entries(widths).forEach(([key, value]) => {
      if (typeof value === 'number' || typeof value === 'string') {
        const widthKey = key.replace(':px', '');
        config.theme.extend.borderWidth[`box-border-${widthKey}`] = normalizeSize(value);
      }
    });
  }

  // Process border colors
  if (resolved.box?.border?.['!color']) {
    const borderColors = resolved.box.border['!color'] as VariableMap;
    Object.entries(borderColors).forEach(([key, value]) => {
      if (typeof value === 'string') {
        const colorValue = resolveColorReference(value, resolved);
        config.theme.extend.colors[`box-border-${kebabToCamel(key)}`] = colorValue;
      }
    });
  }

  // Process box shadow
  if (resolved.box?.shadow) {
    const shadow = resolved.box.shadow as VariableMap;
    if (shadow.color) {
      config.theme.extend.colors['box-shadow'] = shadow.color as string;
    }
    if (shadow['!style']) {
      const styles = shadow['!style'] as VariableMap;
      Object.entries(styles).forEach(([key, value]) => {
        if (typeof value === 'string') {
          config.theme.extend.boxShadow[`box-shadow-${key}`] = value;
        }
      });
    }
  }

  // Process component variables if provided
  if (componentVariables) {
    const componentResolved = formatValues(componentVariables, resolved, true);
    // Store component variables in a separate key for reference
    config.theme.extend['components'] = componentResolved;
  }

  return config;
}
