# Setup Guide for Generated API Client

This guide explains how to set up your project to use the auto-generated API client from `@aipt/utils`.

## Prerequisites

### 1. Install Dependencies

Install the required dependencies for the generated API client:

```bash
npm install @tanstack/react-query class-validator class-transformer
```

### 2. TypeScript Configuration

Your `tsconfig.json` **must** include the following compiler options for the generated code to work properly:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "useDefineForClassFields": true,
    "strictPropertyInitialization": false
  }
}
```

**Why these settings are required:**

- **`experimentalDecorators: true`** - Enables decorator syntax used by class-validator (`@IsString()`, `@IsOptional()`, etc.)
- **`emitDecoratorMetadata: true`** - Emits metadata for decorators, required by class-validator for runtime validation
- **`useDefineForClassFields: true`** - Uses ECMAScript standard field definitions, ensuring decorators work correctly
- **`strictPropertyInitialization: false`** - Allows class properties to be uninitialized when using decorators, as decorators handle initialization

### 3. Swagger JSON Location

The `gen` command reads `swagger.json` from the **current working directory** (`process.cwd()`).

**Important:**

- Place your `swagger.json` file in the project root directory
- Run the `gen` command from the project root
- The script will look for `swagger.json` in `process.cwd()`

Example:

```bash
# From project root
cd /path/to/your/project
gen --output-dirs=app:./src/lib/apis
```

### 4. Swagger Response Format

All API responses in your Swagger/OpenAPI specification **must** wrap the response data in a `data` property.

**Correct format:**

```json
{
  "responses": {
    "200": {
      "content": {
        "application/json": {
          "schema": {
            "type": "object",
            "properties": {
              "data": {
                "$ref": "#/components/schemas/Todo"
              }
            }
          }
        }
      }
    }
  }
}
```

**For array responses:**

```json
{
  "responses": {
    "200": {
      "content": {
        "application/json": {
          "schema": {
            "type": "object",
            "properties": {
              "data": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/Todo"
                }
              }
            }
          }
        }
      }
    }
  }
}
```

This ensures consistent response handling across all generated API functions.

## Quick Start

1. **Install dependencies:**

   ```bash
   npm install @tanstack/react-query class-validator class-transformer
   ```

2. **Configure TypeScript** - Add the required compiler options to `tsconfig.json`

3. **Place `swagger.json`** in your project root

4. **Generate API client:**

   ```bash
   gen --output-dirs=app:./src/lib/apis
   ```

5. **Use generated code:**

   ```tsx
   import { useGetTodos } from '@/lib/apis';

   function MyComponent() {
     const { data } = useGetTodos();
     // ...
   }
   ```

## Troubleshooting

### TypeScript Errors

If you see errors about decorators or metadata:

- Verify all 4 TypeScript compiler options are set in `tsconfig.json`
- Make sure `experimentalDecorators` and `emitDecoratorMetadata` are both `true`
- Restart your TypeScript server/IDE

### Swagger JSON Not Found

Error: `swagger.json file not found`

**Solution:**

- Ensure `swagger.json` is in the project root directory
- Run the `gen` command from the project root
- Check that the file is named exactly `swagger.json` (case-sensitive)

### Response Type Errors

If generated code has incorrect types:

- Verify all API responses in `swagger.json` wrap data in a `data` property
- Check that response schemas follow the format shown above
- Regenerate the API client after fixing the Swagger spec

## Example tsconfig.json

Here's a complete example `tsconfig.json` for a Next.js project:

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "useDefineForClassFields": true,
    "strictPropertyInitialization": false,
    "outDir": "./dist",
    "rootDir": ".",
    "baseUrl": "./src",
    "paths": {
      "@aipt/utils": ["../../packages/utils/src"]
    },
    "noEmit": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```
