import { colorPalette, fadeOut, lighten } from './colorPalette';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type VariableMap = Record<string, any>;
type ComputedValue = string | number;

/**
 * Check if a value is a literal (starts with a-z)
 */
function isLiteral(v: string): boolean {
  if (v.length === 0) return false;
  const firstChar = v[0];
  return firstChar >= 'a' && firstChar <= 'z';
}

/**
 * Get value from variable maps recursively
 */
function getValue(maps: VariableMap[], keyOrVal: string): string {
  for (let i = maps.length; i--; ) {
    const v = maps[i]?.[keyOrVal];
    if (v !== undefined && v !== null) {
      return getValue(maps, v);
    }
  }
  return keyOrVal;
}

/**
 * Resolve function calls like .colorPalette({brand}, 1)
 */
function resolveFunction(funcName: string, args: string[], varsJson: VariableMap): string {
  const resolvedArgs = args.map((arg) => {
    const trimmed = arg.trim();
    // Remove braces and resolve variable references
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      const varName = trimmed.slice(1, -1);
      return getValue([varsJson], varName);
    }
    // Try to resolve as variable
    const resolved = getValue([varsJson], trimmed);
    return resolved !== trimmed ? resolved : trimmed;
  });

  switch (funcName) {
    case 'colorPalette': {
      const [color, index, isAlpha] = resolvedArgs;
      const indexNum = parseInt(index, 10);
      const alpha = isAlpha === 'true' || isAlpha === '1';
      return colorPalette(color, indexNum, alpha);
    }
    case 'fadeOut': {
      const [color, alpha] = resolvedArgs;
      const alphaNum = parseFloat(alpha);
      return fadeOut(color, alphaNum);
    }
    case 'lighten': {
      const [color, amount] = resolvedArgs;
      const amountNum = parseFloat(amount);
      return lighten(color, amountNum);
    }
    default:
      throw new Error(`Unknown function: ${funcName}`);
  }
}

/**
 * Parse and resolve computed values like .colorPalette({brand}, 1)
 */
function resolveComputed(value: string, varsJson: VariableMap, maps: VariableMap[]): string {
  if (!value.startsWith('.')) {
    return value;
  }

  // Handle function calls: .functionName({arg1}, arg2)
  const funcMatch = value.match(/^\.(\w+)\(([^)]+)\)$/);
  if (funcMatch) {
    const [, funcName, argsStr] = funcMatch;
    // Parse arguments, handling braces
    const args: string[] = [];
    let current = '';
    let depth = 0;
    for (let i = 0; i < argsStr.length; i++) {
      const char = argsStr[i];
      if (char === '{') {
        depth++;
        current += char;
      } else if (char === '}') {
        depth--;
        current += char;
      } else if (char === ',' && depth === 0) {
        args.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    if (current.trim()) {
      args.push(current.trim());
    }
    return resolveFunction(funcName, args, varsJson);
  }

  // Handle template strings: .{var1 var2 var3}
  if (value.startsWith('.{')) {
    const content = value.slice(2, -1);
    const parts = content.split(/\s+/).filter(Boolean);
    const resolved = parts.map((part) => {
      if (isLiteral(part)) {
        const resolvedValue = getValue(maps, part);
        if (resolvedValue.startsWith('.')) {
          return resolveComputed(resolvedValue, varsJson, maps);
        }
        return resolvedValue;
      }
      return part;
    });
    return resolved.join(' ');
  }

  // Simple variable reference: .variableName
  const varName = value.slice(1);
  const resolved = getValue(maps, varName);
  if (resolved.startsWith('.')) {
    return resolveComputed(resolved, varsJson, maps);
  }
  return resolved;
}

/**
 * Format a single variable value
 */
export function formatValue(
  themeVars: VariableMap,
  varsJson: VariableMap,
  key: string,
  computed = true
): ComputedValue {
  const value = themeVars[key];

  // If value is already resolved (not a variable reference)
  if (
    typeof value === 'string' &&
    !value.startsWith('.') &&
    themeVars[value] === undefined &&
    varsJson[value] === undefined
  ) {
    return value;
  }

  // If value is a computed expression
  if (typeof value === 'string' && value.startsWith('.')) {
    if (computed) {
      return resolveComputed(value, varsJson, [themeVars, varsJson]);
    }
    return value;
  }

  // If value references another variable
  if (typeof value === 'string') {
    const resolved = getValue([themeVars, varsJson], value);
    if (resolved.startsWith('.')) {
      return computed ? resolveComputed(resolved, varsJson, [themeVars, varsJson]) : resolved;
    }
    return resolved;
  }

  return value;
}

/**
 * Format all variables recursively
 */
export function formatValues(
  themeVars: VariableMap,
  varsJson: VariableMap = {},
  computed = true,
  keyPath: string[] = []
): VariableMap {
  const varsMap: VariableMap = {};

  Object.keys(themeVars).forEach((key) => {
    const keys = [...keyPath, key];
    const value = themeVars[key];

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Recursively process nested objects
      varsMap[key] = formatValues(value, varsJson, computed, keys);
    } else {
      // Process leaf values
      const formattedValue = formatValue(themeVars, varsJson, key, computed);
      varsMap[key] = formattedValue;
    }
  });

  return varsMap;
}
