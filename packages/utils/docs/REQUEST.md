# Request API Documentation

The `@aipt/utils` package provides a powerful request utility that works seamlessly with auto-generated API client code from Swagger/OpenAPI specifications.

## Overview

The request module provides:

- Type-safe API request functions
- Automatic authentication token handling
- Response validation using class-validator
- React Query hooks for data fetching
- Error handling and retry logic

## Prerequisites

Before using the request API, you need to:

1. **Install required dependencies:**

   ```bash
   npm install @tanstack/react-query class-validator class-transformer
   ```

2. **Configure TypeScript** - Add the following to your `tsconfig.json`:

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

   These settings are required for class-validator decorators to work properly.

   See [SETUP.md](./SETUP.md) for detailed setup instructions.

3. **Generate API client code** using the `gen` command (see below)

## Generating API Client Code

The `gen` command automatically generates TypeScript API client code from your Swagger/OpenAPI JSON specification.

### Basic Usage

```bash
# Generate API code to a single directory
gen --output-dirs=app:./src/lib/apis

# Generate API code to multiple directories
gen --output-dirs=app:./src/lib/apis,operation:./src/lib/ops
```

### Command Options

- `--output-dirs=<key:path>[,<key:path>...]` - Specify output directories
  - Format: `key1:path1,key2:path2`
  - Example: `--output-dirs=app:./src/apis`

- `--project=<type>` - Project type (for backward compatibility)
  - Supported types: `app`, `operation`
  - Example: `--project=app`

- `-h, --help` - Show help message

### Swagger JSON Location

The `gen` command reads `swagger.json` from the current working directory (`process.cwd()`). Make sure to place your `swagger.json` file in the project root before running the command.

### Default Output Location

By default, the generated API code is placed in `src/lib/apis` directory of your project.

### Generated Files

The `gen` command generates:

1. **`types.ts`** - TypeScript type definitions and validation classes
2. **`<tag>.ts`** - API functions and React Query hooks grouped by API tags
3. **`index.ts`** - Barrel export file

### Example Generated Code Structure

```
src/lib/apis/
├── types.ts          # Type definitions
├── auth.ts           # Authentication APIs
├── todos.ts          # Todo list APIs
└── index.ts          # Exports
```

## Using Generated API Code

### 1. Setup React Query Provider

First, wrap your app with the React Query provider:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return <QueryClientProvider client={queryClient}>{/* Your app */}</QueryClientProvider>;
}
```

### 2. Using Query Hooks (GET requests)

```tsx
import { useGetTodos } from '@/lib/apis';

function TodoList() {
  const { data, isLoading, error } = useGetTodos({
    queryParams: { page: 1, limit: 10 },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {data?.data.map((todo) => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  );
}
```

### 3. Using Mutation Hooks (POST/PUT/DELETE)

```tsx
import { useCreateTodo, useUpdateTodo, useDeleteTodo } from '@/lib/apis';

function TodoForm() {
  const createTodo = useCreateTodo();

  const handleSubmit = async (data: CreateTodoDTO) => {
    try {
      await createTodo.mutateAsync({ data });
      // Success - cache will be invalidated automatically
    } catch (error) {
      console.error('Failed to create todo:', error);
    }
  };

  return <form onSubmit={handleSubmit}>{/* Form fields */}</form>;
}
```

### 4. Direct API Function Calls

You can also call API functions directly without React Query:

```tsx
import { getTodo, createTodo } from '@/lib/apis';

// In an async function
async function fetchTodo(id: string) {
  try {
    const response = await getTodo({ pathParams: { id } });
    console.log('Todo:', response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

## Configuration

### Setting Base URL

The API base URL is read from the `NEXT_PUBLIC_API_URL` environment variable:

```env
NEXT_PUBLIC_API_URL=https://api.example.com
```

### Authentication

The request module automatically:

- Reads the auth token from storage (`authToken` key)
- Adds `Authorization: Bearer <token>` header to requests
- Handles 401/422 errors by redirecting to login

To set the auth token:

```tsx
import { storage } from '@aipt/utils';

await storage.setItem('authToken', 'your-token-here');
```

### Custom Request Options

```tsx
import { apiRequest } from '@aipt/utils/request';

const response = await apiRequest('/custom-endpoint', {
  method: 'POST',
  body: JSON.stringify({ data: 'value' }),
  noAuthorize: true, // Skip authentication
  params: { query: 'param' }, // Query parameters
});
```

## Dependencies

The generated API code requires:

- **@tanstack/react-query** - For React Query hooks
- **class-validator** - For request/response validation
- **class-transformer** - For data transformation

Make sure these are installed in your project:

```bash
npm install @tanstack/react-query class-validator class-transformer
```

## TypeScript Configuration

Your `tsconfig.json` must include the following compiler options for the generated code to work:

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

**Why these settings are needed:**

- `experimentalDecorators`: Enables decorator syntax (`@IsString()`, etc.)
- `emitDecoratorMetadata`: Emits metadata for decorators (required by class-validator)
- `useDefineForClassFields`: Uses ECMAScript standard field definitions
- `strictPropertyInitialization`: Set to `false` to allow uninitialized class properties with decorators

## Type Safety

All generated functions are fully typed:

```tsx
// TypeScript knows the exact shape of request and response
const response = await getTodo({
  pathParams: { id: '123' }, // TypeScript validates this
});

// response.data is typed based on your Swagger schema
console.log(response.data.title); // TypeScript autocomplete works!
```

## Error Handling

The request module provides comprehensive error handling:

```tsx
try {
  const response = await createTodo({ data: todoData });
} catch (error) {
  if (error instanceof ApiError) {
    console.error('API Error:', error.message, error.status);
  } else {
    console.error('Network Error:', error);
  }
}
```

## Swagger Specification Requirements

### Response Format

All API responses in your Swagger specification **must** be wrapped in a `data` property:

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

This ensures consistent response handling across all generated API functions.

### Swagger JSON Location

The `gen` command looks for `swagger.json` in the current working directory. When you run the command, make sure:

1. Your `swagger.json` file is in the project root
2. You run the `gen` command from the project root directory

Example:

```bash
# From project root
gen --output-dirs=app:./src/lib/apis
```

## Best Practices

1. **Always use generated hooks** in React components for automatic caching and refetching
2. **Use direct API calls** only in server-side code or non-React contexts
3. **Handle errors gracefully** with try-catch blocks
4. **Set up React Query DevTools** in development for debugging
5. **Keep your Swagger spec up to date** and regenerate API code regularly
6. **Ensure all API responses wrap data in a `data` property** for consistent handling

## Troubleshooting

### Generated code not found

Make sure you've run the `gen` command and the output directory exists.

### Type errors

Ensure `@tanstack/react-query`, `class-validator`, and `class-transformer` are installed.

### Authentication issues

Check that the auth token is set in storage and the `NEXT_PUBLIC_API_URL` is configured correctly.
