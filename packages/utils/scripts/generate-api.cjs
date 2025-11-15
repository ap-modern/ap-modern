const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);

// Parse output directories from command line arguments
// Format: --output-dirs=app:path1,operation:path2
const outputDirsArg = args.find((arg) => arg.startsWith('--output-dirs='));
let outputDirs = {};
let projectType = '';
if (outputDirsArg) {
  const dirsString = outputDirsArg.split('=')[1];
  const dirsPairs = dirsString.split(',');
  for (const pair of dirsPairs) {
    const [key, value] = pair.split(':');
    if (key && value) {
      projectType = key;
      outputDirs[key] = path.resolve(value);
    }
  }
}

// Parse project type (for backward compatibility)
const multiImplicitProject = args.find((arg) => arg.startsWith('--project='))?.split('=')[1];
projectType = multiImplicitProject || projectType;
if (!projectType) {
  console.error(
    'Error: Project type not specified. Use --output-dirs=key:path or --project=type (app, operation)'
  );
  process.exit(1);
}

// Read swagger.json
const swaggerPath = path.join(process.cwd(), 'swagger.json');
if (!fs.existsSync(swaggerPath)) {
  console.error(
    'Error: swagger.json file not found. Please run the server to generate swagger.json first.'
  );
  process.exit(1);
}
const swagger = JSON.parse(fs.readFileSync(swaggerPath, 'utf8'));

// Determine output directory
let outputDir;
if (projectType && outputDirs[projectType]) {
  outputDir = outputDirs[projectType];
} else if (Object.keys(outputDirs).length === 1) {
  // If only one output directory is provided, use it
  outputDir = Object.values(outputDirs)[0];
} else if (projectType) {
  // Fallback to default paths for backward compatibility
  const defaultOutputDirs = {
    app: path.join(__dirname, '../apps/lago-app/src/lib/apis'),
    operation: path.join(__dirname, '../apps/lago-operation/src/lib/apis'),
  };
  outputDir = defaultOutputDirs[projectType];
}

if (!outputDir) {
  console.error(
    `Error: Output directory not specified. Use --output-dirs=key:path or --project=type (app, operation)`
  );
  process.exit(1);
}

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Define tag filtering rules
const tagMappings = {
  app: [
    'Auth',
    'Products',
    'Orders',
    'Chat',
    'Communities',
    'Users',
    'Share',
    'Onboarding',
    'Uploads',
  ],
  operation: ['Auth', 'AdminUsers', 'AdminProducts', 'AdminOrders', 'AdminDashboard', 'Uploads'],
};

// Type mapping
const typeMapping = {
  string: 'string',
  integer: 'number',
  number: 'number',
  boolean: 'boolean',
  array: 'any[]',
  object: 'any',
};

// Validator decorator mapping
const validatorMapping = {
  string: 'IsString',
  integer: 'IsNumber',
  number: 'IsNumber',
  boolean: 'IsBoolean',
  array: 'IsArray',
  object: 'IsObject',
};

// Generate type definition
function generateTypeDefinition(schema, name, enumTypes = null, inline = false) {
  if (!schema || !schema.properties) {
    return '';
  }

  let typeDef = `export class ${name} {\n`;

  for (const [propName, propSchema] of Object.entries(schema.properties)) {
    const isOptional = !schema.required || !schema.required.includes(propName);
    const type = getTypeFromSchema(propSchema, enumTypes, inline);
    const validatorCall = generateValidatorCall(propSchema, enumTypes, inline);

    typeDef += `  ${validatorCall}\n`;
    if (isOptional) {
      typeDef += `  @IsOptional()\n`;
    }
    typeDef += `  ${propName}${isOptional ? '?' : ''}: ${type};\n\n`;
  }

  typeDef += '}\n';
  return typeDef;
}

// Get type from schema
function getTypeFromSchema(schema, enumTypes = null, inline = false) {
  if (schema.$ref) {
    const refName = schema.$ref.split('/').pop();
    return inline ? refName : `Types.${refName}`;
  }

  if (schema.type === 'array' && schema.items) {
    const itemType = getTypeFromSchema(schema.items, enumTypes, inline);
    return `${itemType}[]`;
  }

  if (schema.enum) {
    // If enum type mapping exists, use enum type
    if (enumTypes) {
      const enumKey = schema.enum.join('_');
      for (const [key, enumType] of enumTypes) {
        if (key === enumKey) {
          return inline ? enumType.name : `Types.${enumType.name}`;
        }
      }
    }
    // Otherwise use union type
    return schema.enum.map((e) => `'${e}'`).join(' | ');
  }

  if (schema.format === 'date-time') {
    return 'string'; // or Date
  }
  if (schema.format === 'binary') {
    return 'File';
  }

  return typeMapping[schema.type] || 'any';
}

// Get validator decorator from schema
function getValidatorFromSchema(schema) {
  if (schema.$ref) {
    return 'ValidateNested';
  }

  if (schema.type === 'array') {
    return 'IsArray';
  }

  if (schema.enum) {
    return 'IsEnum';
  }

  return validatorMapping[schema.type] || 'IsString';
}

// Generate validator decorator call
function generateValidatorCall(schema, enumTypes = null, inline = false) {
  if (schema.$ref) {
    return '@ValidateNested()';
  }

  if (schema.type === 'array') {
    return '@IsArray()';
  }

  if (schema.enum) {
    // If enum type mapping exists, use enum type
    if (enumTypes) {
      const enumKey = schema.enum.join('_');
      for (const [key, enumType] of enumTypes) {
        if (key === enumKey) {
          return inline ? `@IsEnum(${enumType.name})` : `@IsEnum(Types.${enumType.name})`;
        }
      }
    }
    // Otherwise use array form
    const enumValues = schema.enum.map((e) => `'${e}'`).join(', ');
    return `@IsEnum([${enumValues}])`;
  }

  const validator = validatorMapping[schema.type] || 'IsString';
  return `@${validator}()`;
}

function upperFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function camelCase(str) {
  return str.replace(/[_-]([a-z])/g, (_, letter) => letter.toUpperCase());
}

// Generate function name - combine method and last word of path, avoid numeric suffix
function getFunctionName(path, method, operation) {
  if (operation.operationId) {
    return operation.operationId;
  }

  const methodPrefix = method.toLowerCase();
  const pathParts = path
    .split('/')
    .filter((p) => p && p !== 'api')
    .filter((name) => name[0] !== '{');
  const single = pathParts.length === 1;
  if (pathParts[0] && !single && pathParts[0].endsWith('s')) {
    pathParts[0] = pathParts[0].slice(0, -1);
  }

  // Handle plural forms
  let resource = camelCase(pathParts.join('-'));
  if (resource.endsWith('s') && !single && methodPrefix !== 'get') {
    resource = resource.slice(0, -1);
  }
  const operateSuffix = !usedFunctionNames.has(resource)
    ? ''
    : methodPrefix === 'get'
      ? 'Detail'
      : methodPrefix === 'post'
        ? 'Create'
        : methodPrefix === 'put'
          ? 'Update'
          : methodPrefix === 'delete'
            ? 'Delete'
            : '';
  // Generate more specific function name based on path and operation
  let functionName = camelCase(
    `${operateSuffix === 'Detail' && resource.endsWith('s') ? resource.slice(0, -1) : resource}${operateSuffix}`
  );

  return functionName;
}

// Generate parameter type name
function getParamTypeName(functionName, paramType) {
  const baseName = functionName.charAt(0).toUpperCase() + functionName.slice(1);
  return `${baseName}${paramType}`;
}

// Generate return type name
function getResponseTypeName(functionName) {
  const baseName = functionName.charAt(0).toUpperCase() + functionName.slice(1).replace('-', '');
  return `${baseName}Response`;
}

// Generate API function
function generateApiFunction(path, method, operation, customFunctionName = null) {
  const functionName = customFunctionName || getFunctionName(path, method, operation);
  const params = getPathParams(path);
  let hasBody = ['post', 'put', 'patch'].includes(method.toLowerCase());
  const isGet = method.toLowerCase() === 'get';

  let func = `/**
 * ${operation.summary || operation.operationId || functionName}
 */
export async function ${functionName}(\n`;

  // Parameters
  const paramList = [];
  if (params.length > 0) {
    const pathParamsType = getParamTypeName(functionName, 'PathParams');
    paramList.push(`  pathParams: ${pathParamsType}`);
  }

  if (hasBody) {
    const requestBodyType = getRequestBodyType(operation, functionName);
    if (requestBodyType) {
      paramList.push(`  data: ${requestBodyType}`);
    } else {
      hasBody = false;
    }
  }

  if (isGet && operation.parameters) {
    const queryParams = operation.parameters.filter((p) => p.in === 'query');
    if (queryParams.length > 0) {
      const queryParamsType = getParamTypeName(functionName, 'QueryParams');
      paramList.push(`  queryParams?: ${queryParamsType}`);
    }
  }

  paramList.push('  noAuthorize?: boolean');

  func += paramList.join(',\n');

  // Return type
  const responseType = getResponseType(operation, functionName);
  func += `\n): Promise<HTTPResponse<${responseType}>> {\n`;

  // Build URL
  let url = path;
  if (params.length > 0) {
    url = path.replace(/\{([^}]+)\}/g, (match, param) => `\${pathParams.${param}}`);
    url = `\`${url}\``;
  } else {
    url = `"${url}"`;
  }

  // Build request options
  func += `  return await apiRequest<${responseType}>(${url}, {\n`;
  func += `    method: '${method.toUpperCase()}',\n`;

  if (hasBody) {
    const hasFormData = operation.requestBody.content['multipart/form-data'];
    if (hasFormData) {
      func += '    body: jsonToFormData(data),\n';
      func += '    headers: { "Content-Type": null },\n';
    } else {
      func += '    body: JSON.stringify(data),\n';
    }
  }
  func += '    noAuthorize: noAuthorize,\n';

  if (isGet && operation.parameters) {
    const queryParams = operation.parameters.filter((p) => p.in === 'query');
    if (queryParams.length > 0) {
      func += '    params: queryParams,\n';
    }
  }

  func += '  });\n';
  func += '}\n\n';

  return func;
}

// Generate React Query Hook
function generateHook(path, method, operation, customFunctionName = null) {
  const functionName = customFunctionName || getFunctionName(path, method, operation);
  const hookName = `use${functionName.charAt(0).toUpperCase() + functionName.slice(1)}`;
  const isGet = method.toLowerCase() === 'get';
  const isMutation = !isGet;

  if (isMutation) {
    return generateMutationHook(hookName, functionName, operation, path, method);
  } else {
    return generateQueryHook(hookName, functionName, operation, path, method);
  }
}

// Generate Query Hook
function generateQueryHook(hookName, functionName, operation, path, method) {
  const cacheKey = getCacheKey(operation);
  const params = getPathParams(path);
  const isGet = method.toLowerCase() === 'get';

  let hook = `/**
 * ${operation.summary || operation.operationId || hookName} Hook
 */
export function ${hookName}(\n`;

  const paramList = [];
  if (params.length > 0) {
    const pathParamsType = getParamTypeName(functionName, 'PathParams');
    paramList.push(`  pathParams: ${pathParamsType}`);
  }

  if (isGet && operation.parameters) {
    const queryParams = operation.parameters.filter((p) => p.in === 'query');
    if (queryParams.length > 0) {
      const queryParamsType = getParamTypeName(functionName, 'QueryParams');
      paramList.push(`  queryParams?: ${queryParamsType}`);
    }
  }

  paramList.push(
    `  options?: UseQueryOptions<HTTPResponse<${upperFirst(functionName)}Response>, Error>`
  );

  hook += paramList.join(',\n');
  hook += '\n) {\n';

  hook += `  return useQuery({\n`;

  // Build queryKey
  let queryKeyParts = [cacheKey];
  if (params.length > 0) {
    queryKeyParts.push(...params.map((name) => `pathParams.${name}`));
  }
  if (isGet && operation.parameters) {
    const queryParams = operation.parameters.filter((p) => p.in === 'query');
    if (queryParams.length > 0) {
      queryKeyParts.push(...queryParams.map((item) => `queryParams?.${item.name}`));
    }
  }
  hook += `    queryKey: [${queryKeyParts.join(', ')}],\n`;

  // Build queryFn
  let queryFnParams = [];
  if (params.length > 0) {
    queryFnParams.push('pathParams');
  }
  if (isGet && operation.parameters) {
    const queryParams = operation.parameters.filter((p) => p.in === 'query');
    if (queryParams.length > 0) {
      queryFnParams.push('queryParams');
    }
  }
  hook += `    queryFn: () => ${functionName}(${queryFnParams.join(', ')}),\n`;
  hook += `    ...options,\n`;
  hook += `  });\n`;

  hook += '}\n\n';

  return hook;
}

// Generate Mutation Hook
function generateMutationHook(hookName, functionName, operation, path, method) {
  const cachePatterns = getCacheInvalidationPatterns(operation);
  const params = getPathParams(path);
  const hasBody = ['post', 'put', 'patch'].includes(method.toLowerCase());

  let hook = `/**
 * ${operation.summary || operation.operationId || hookName} Hook
 */
export function ${hookName}(\n`;

  // Build parameter types
  const paramList = [];
  if (params.length > 0) {
    const pathParamsType = getParamTypeName(functionName, 'PathParams');
    paramList.push(`  pathParams: ${pathParamsType}`);
  }

  const requestBodyType = hasBody ? getRequestBodyType(operation, functionName) : 'any';

  paramList.push(
    `  options?: UseMutationOptions<HTTPResponse<${getResponseTypeName(functionName)}>, Error, ${requestBodyType}>`
  );

  hook += paramList.join(',\n');
  hook += '\n) {\n';
  hook += '  const queryClient = useQueryClient();\n\n';
  hook += '  return useMutation({\n';

  // Build mutationFn
  let mutationFnParams = [];
  let mutationFnCallParams = [];
  if (params.length > 0) {
    mutationFnCallParams.push('pathParams');
  }
  if (hasBody) {
    const requestBodyType = getRequestBodyType(operation, functionName);
    if (requestBodyType) {
      mutationFnParams.push('data');
      mutationFnCallParams.push('data');
    }
  }
  hook += `    mutationFn: (${mutationFnParams.join(', ')}) => ${functionName}(${mutationFnCallParams.join(', ')}),\n`;

  if (cachePatterns.length > 0) {
    hook += '    onSuccess: () => {\n';
    hook += '      // Invalidate related cache\n';
    cachePatterns.forEach((pattern) => {
      hook += `      void queryClient.invalidateQueries({ queryKey: [${pattern}] });\n`;
    });
    hook += '    },\n';
  }

  hook += '    onError: (error: any) => {\n';
  hook += "      console.error('Mutation failed:', error);\n";
  hook += '    },\n';
  hook += '    ...options,\n';
  hook += '  });\n';

  hook += '}\n\n';

  return hook;
}

// Helper functions
function getPathParams(path) {
  const matches = path.match(/\{([^}]+)\}/g);
  return matches ? matches.map((m) => m.slice(1, -1)) : [];
}

function getRequestBodyType(operation, functionName) {
  if (!operation.requestBody || !operation.requestBody.content) {
    return null;
  }

  const content =
    operation.requestBody.content['application/json'] ||
    operation.requestBody.content['multipart/form-data'];
  if (!content || !content.schema) {
    return null;
  }

  // If inline schema, generate DTO type
  if (content.schema.type === 'object' && content.schema.properties) {
    return getParamTypeName(functionName, 'DTO');
  }

  return getTypeFromSchema(content.schema);
}

function getResponseType(operation, functionName) {
  // Try 200 response first, then 201, then any 2xx
  let response = operation.responses['200'] || operation.responses['201'];
  if (!response) {
    const statusCodes = Object.keys(operation.responses || {});
    const successCode = statusCodes.find((code) => code.startsWith('2'));
    if (successCode) {
      response = operation.responses[successCode];
    }
  }

  if (!response || !response.content) {
    return 'any';
  }

  const content = response.content['application/json'];
  if (!content || !content.schema) {
    return 'any';
  }

  // All API responses should be wrapped in a data property
  // Handle response structure: { data: {...} }
  if (content.schema.type === 'object' && content.schema.properties) {
    // Find type definition for data part
    const dataSchema = content.schema.properties.data;

    if (dataSchema) {
      if (dataSchema.type === 'object' && dataSchema.properties) {
        return getResponseTypeName(functionName);
      }
      if (dataSchema.type === 'array' && dataSchema.items) {
        // For array responses, extract the item type
        const itemType = getTypeFromSchema(dataSchema.items);
        return `${itemType}[]`;
      }
      return getTypeFromSchema(dataSchema);
    }
  }

  // If ApiResponse reference
  if (content.schema.$ref && content.schema.$ref.endsWith('Response')) {
    return getResponseTypeName(functionName);
  }

  // If schema doesn't have data wrapper, assume it's the data itself
  // This handles cases where the schema directly represents the data
  return getTypeFromSchema(content.schema);
}

function getCacheKey(operation) {
  const tags = operation.tags || ['default'];
  const summary = operation.summary || operation.operationId || 'unknown';
  return `'${tags[0].toLowerCase()}', '${summary.toLowerCase().replace(/\s+/g, '_')}'`;
}

function getCacheInvalidationPatterns(operation) {
  const tags = operation.tags || ['default'];
  return tags.map((tag) => `'${tag.toLowerCase()}'`);
}

function generateTypeDefinitionAllOf(schema, name, enumTypes = null, inline = false) {
  const extendsTypes = [];
  for (const item of schema.allOf) {
    if (item.type === 'object' && item.properties) {
      const interfaceType = generateTypeDefinition(item, name, enumTypes, inline);
      const classType = interfaceType.replace(/export class ([\w]+) {/, ($0, $1) => {
        return `export class ${$1} extends ${extendsTypes.join(', ')} {`;
      });
      return classType;
    } else if (item.$ref) {
      const refName = item.$ref.split('/').pop();
      extendsTypes.push(inline ? refName : `Types.${refName}`);
    }
  }
}

// Generate parameter type definitions
function generateParamTypes(path, method, operation, functionName, enumTypes = null) {
  const types = [];
  const params = getPathParams(path);
  const hasBody = ['post', 'put', 'patch'].includes(method.toLowerCase());
  const isGet = method.toLowerCase() === 'get';

  // Generate PathParams type
  if (params.length > 0) {
    const pathParamsType = getParamTypeName(functionName, 'PathParams');
    let typeDef = `export class ${pathParamsType} {\n`;
    params.forEach((param) => {
      typeDef += `  @IsString()\n`;
      typeDef += `  ${param}: string;\n\n`;
    });
    typeDef += '}\n\n';
    types.push(typeDef);
  }

  // Generate QueryParams type
  if (isGet && operation.parameters) {
    const queryParams = operation.parameters.filter((p) => p.in === 'query');
    if (queryParams.length > 0) {
      const queryParamsType = getParamTypeName(functionName, 'QueryParams');
      let typeDef = `export class ${queryParamsType} {\n`;
      queryParams.forEach((param) => {
        const isOptional = !param.required;
        const type = getTypeFromSchema(param.schema, enumTypes);
        const validatorCall = generateValidatorCall(param.schema, enumTypes);

        typeDef += `  ${validatorCall}\n`;
        if (isOptional) {
          typeDef += `  @IsOptional()\n`;
        }
        typeDef += `  ${param.name}${isOptional ? '?' : ''}: ${type};\n\n`;
      });
      typeDef += '}\n\n';
      types.push(typeDef);
    }
  }

  // Generate DTO type
  if (hasBody && operation.requestBody && operation.requestBody.content) {
    const content =
      operation.requestBody.content['application/json'] ||
      operation.requestBody.content['multipart/form-data'];
    if (content && content.schema) {
      const dtoType = getParamTypeName(functionName, 'DTO');
      if (content.schema.allOf) {
        const type = generateTypeDefinitionAllOf(content.schema, dtoType, enumTypes);
        type && types.push(type + '\n');
      } else if (content.schema.type === 'object' && content.schema.properties) {
        types.push(generateTypeDefinition(content.schema, dtoType, enumTypes));
      }
    }
  }

  // Generate Response type
  const response = operation.responses['200'] || operation.responses['201'];
  const responseType = getResponseTypeName(functionName);
  if (response && response.content) {
    const content = response.content['application/json'];
    if (content && content.schema) {
      if (content.schema.allOf) {
        for (const item of content.schema.allOf) {
          if (item.type === 'object' && item.properties) {
            const dataSchema = item.properties.data;
            if (dataSchema) {
              if (dataSchema.allOf) {
                const type = generateTypeDefinitionAllOf(dataSchema, responseType, enumTypes);
                type && types.push(type + '\n');
              } else if (dataSchema.type === 'object' && dataSchema.properties) {
                types.push(generateTypeDefinition(dataSchema, responseType, enumTypes));
              } else {
                types.push(`export type ${responseType} = any;\n\n`);
              }
            }
          }
        }
      } else if (content.schema.type === 'object' && content.schema.properties) {
        // All API responses should be wrapped in a data property
        const dataSchema = content.schema.properties.data;
        if (dataSchema) {
          if (dataSchema.type === 'object' && dataSchema.properties) {
            types.push(generateTypeDefinition(dataSchema, responseType, enumTypes));
          } else if (dataSchema.type === 'array' && dataSchema.items) {
            // For array responses, generate type for the item
            const itemSchema = dataSchema.items;
            if (itemSchema.type === 'object' && itemSchema.properties) {
              types.push(generateTypeDefinition(itemSchema, responseType, enumTypes));
            } else {
              types.push(`export type ${responseType} = any;\n\n`);
            }
          } else {
            types.push(`export type ${responseType} = any;\n\n`);
          }
        } else {
          // If no data property, assume the schema itself is the data
          types.push(generateTypeDefinition(content.schema, responseType, enumTypes));
        }
      } else if (content.schema.$ref && content.schema.$ref.endsWith('Response')) {
        types.push(
          `export type ${responseType} = Types.${content.schema.$ref.split('/').pop()};\n\n`
        );
      }
    }
  }

  return types.join('');
}

const enumTypes = new Map();
// Extract enum types
function extractEnumTypes(schemas) {
  for (const [name, schema] of Object.entries(schemas)) {
    // if (name === 'ApiResponse' || name === 'ErrorResponse') continue;

    if (schema.properties) {
      for (const [propName, propSchema] of Object.entries(schema.properties)) {
        if (propSchema.enum) {
          const enumKey = propSchema.enum.join('_');
          const enumName = `${name}${propName.charAt(0).toUpperCase() + propName.slice(1)}`;

          if (!enumTypes.has(enumKey)) {
            enumTypes.set(enumKey, {
              name: enumName,
              values: propSchema.enum,
            });
          }
        }
      }
    }
  }

  return enumTypes;
}

// Generate enum type definitions
function generateEnumTypes(enumTypes) {
  let enumContent = '';

  for (const [key, enumType] of enumTypes) {
    enumContent += `export enum ${enumType.name} {\n`;
    enumType.values.forEach((value) => {
      const enumKey = value.toUpperCase().replace(/-/g, '_');
      enumContent += `  ${enumKey} = '${value}',\n`;
    });
    enumContent += '}\n\n';
  }

  return enumContent;
}

// Track generated function names to avoid duplicates
const usedFunctionNames = new Set();
// Determine tags to filter
const allowedTags = tagMappings[projectType] || [];

// Main generation function
function generateApiFiles() {
  console.log('Starting API code generation...');

  // Extract enum types
  const enumTypes = extractEnumTypes(swagger.components.schemas);

  // Generate all type definitions to types.ts
  const typesFile = path.join(outputDir, 'types.ts');
  let typesContent = `/* eslint-disable @typescript-eslint/no-unused-vars */\nimport { IsString, IsNumber, IsBoolean, IsArray, IsObject, IsOptional, IsEnum, ValidateNested } from 'class-validator';\n`;
  typesContent += `import { Type } from 'class-transformer';\n\n`;

  // Generate enum types
  typesContent += generateEnumTypes(enumTypes);

  // Generate types from schemas
  for (const [name, schema] of Object.entries(swagger.components.schemas)) {
    // if (!name.endsWith('Response') || (name === 'ApiResponse' || name === 'ErrorResponse')) {
    typesContent += generateTypeDefinition(schema, name, enumTypes, true);
    typesContent += '\n';
    // }
  }

  fs.writeFileSync(typesFile, typesContent);
  console.log(`Generated type definitions: ${typesFile}`);

  console.log(
    `Starting API code generation (project: ${projectType}, tag filter: ${allowedTags.join(', ')})...`
  );
  // Group APIs by tag and generate files
  const tagGroups = {};

  for (const [path, methods] of Object.entries(swagger.paths)) {
    for (const [method, operation] of Object.entries(methods)) {
      const [tag, project] = operation.tags;
      // Filter: only include tags for specified project
      if (
        multiImplicitProject &&
        project !== upperFirst(multiImplicitProject) &&
        !allowedTags?.includes(tag)
      ) {
        continue; // Skip non-matching interfaces
      }

      if (!tagGroups[tag]) {
        tagGroups[tag] = [];
      }

      tagGroups[tag].push({ path, method, operation });
    }
  }

  if (Object.keys(tagGroups).length === 0) {
    console.warn(
      `Warning: No matching interfaces found (project: ${projectType}, tags: ${allowedTags.join(', ')})`
    );
    return;
  }

  // Generate API files for each tag
  for (const [tag, apis] of Object.entries(tagGroups)) {
    const fileName = `${tag.toLowerCase()}.ts`;
    const filePath = path.join(outputDir, fileName);

    let content = `/* eslint-disable @typescript-eslint/no-unused-vars */\n/* eslint-disable @typescript-eslint/no-explicit-any */\nimport { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';\n`;
    content += `import { apiRequest, HTTPResponse, jsonToFormData } from '@aipt/utils';\n`;
    content += `import * as Types from './types';\n`;
    content += `import { IsString, IsNumber, IsBoolean, IsArray, IsObject, IsOptional, IsEnum, ValidateNested } from 'class-validator';\n\n`;

    // Generate parameter and response type definitions
    for (const { path, method, operation } of apis) {
      let functionName = getFunctionName(path, method, operation);
      let counter = 1;
      const originalName = functionName;

      // Ensure function name is unique
      while (usedFunctionNames.has(functionName)) {
        functionName = `${originalName}${counter}`;
        counter++;
      }
      usedFunctionNames.add(functionName);

      const paramTypes = generateParamTypes(path, method, operation, functionName, enumTypes);
      content += paramTypes;

      content = content.replace(
        `import { IsString, IsNumber, IsBoolean, IsArray, IsObject, IsOptional, IsEnum, ValidateNested } from 'class-validator';\n\n`,
        `import { IsString, IsNumber, IsBoolean, IsArray, IsObject, IsOptional, IsEnum, ValidateNested } from 'class-validator';\n\n`
      );
    }

    // Reset for API functions
    usedFunctionNames.clear();

    // Generate API functions
    for (const { path, method, operation } of apis) {
      let functionName = getFunctionName(path, method, operation);
      let counter = 1;
      const originalName = functionName;

      // Ensure function name is unique
      while (usedFunctionNames.has(functionName)) {
        functionName = `${originalName}${counter}`;
        counter++;
      }
      usedFunctionNames.add(functionName);

      content += generateApiFunction(path, method, operation, functionName);
    }

    // Reset for hooks
    usedFunctionNames.clear();

    // Generate Hooks
    for (const { path, method, operation } of apis) {
      let functionName = getFunctionName(path, method, operation);
      let counter = 1;
      const originalName = functionName;

      // Ensure function name is unique
      while (usedFunctionNames.has(functionName)) {
        functionName = `${originalName}${counter}`;
        counter++;
      }
      usedFunctionNames.add(functionName);

      content += generateHook(path, method, operation, functionName);
    }

    fs.writeFileSync(filePath, content);
    console.log(`Generated API file: ${filePath}`);
  }

  // Generate index file
  const indexFile = path.join(outputDir, 'index.ts');
  let indexContent = `// Auto-generated API code\n`;
  indexContent += `export * from './types';\n`;

  for (const tag of Object.keys(tagGroups)) {
    indexContent += `export * from './${tag.toLowerCase()}';\n`;
  }

  fs.writeFileSync(indexFile, indexContent);
  console.log(`Generated index file: ${indexFile}`);

  console.log('API code generation completed!');
}

// Run generator
generateApiFiles();
