# Safe API Example

This example demonstrates how to use the auto-generated API client with Next.js and the `gen` command.

## Features

- Next.js 14 App Router
- Todo list API with CRUD operations
- Swagger/OpenAPI specification
- Auto-generated API client code
- React Query integration

## Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Configure TypeScript - The `tsconfig.json` already includes the required settings:
   - `experimentalDecorators: true`
   - `emitDecoratorMetadata: true`
   - `useDefineForClassFields: true`
   - `strictPropertyInitialization: false`

3. Start the development server:

   ```bash
   pnpm dev
   ```

4. Generate API client code:

   ```bash
   # Fetch swagger.json and generate API client
   pnpm gen:fetch

   # Or just generate if swagger.json already exists
   pnpm gen
   ```

   **Note:** The `swagger.json` file will be saved to the project root directory (`process.cwd()`).

## Usage

### Generating API Client

The `gen` command automatically generates TypeScript API client code from the Swagger specification:

```bash
# Generate to default location (src/lib/apis)
pnpm gen

# Or fetch swagger first, then generate
pnpm gen:fetch
```

**Important Notes:**

- The `swagger.json` file is read from the current working directory (project root)
- All API responses in `swagger.json` must wrap the response data in a `data` property
- The generated code requires the TypeScript decorator settings mentioned above

The generated code includes:

- Type-safe API functions
- React Query hooks
- Request/response validation classes

### Using Generated API Code

After running `gen`, you can use the generated hooks in your components:

```tsx
import { useGetTodos, useCreateTodo } from '@/lib/apis';

function TodoList() {
  const { data, isLoading } = useGetTodos();
  const createTodo = useCreateTodo();

  // Use the hooks...
}
```

## API Endpoints

- `GET /api/todos` - Get all todos (supports pagination and filtering)
- `POST /api/todos` - Create a new todo
- `GET /api/todos/[id]` - Get a single todo
- `PUT /api/todos/[id]` - Update a todo
- `DELETE /api/todos/[id]` - Delete a todo
- `GET /api/swagger` - Get Swagger/OpenAPI specification

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── todos/
│   │   │   ├── route.ts          # GET, POST /api/todos
│   │   │   └── [id]/route.ts     # GET, PUT, DELETE /api/todos/[id]
│   │   └── swagger/
│   │       └── route.ts          # Swagger specification
│   ├── layout.tsx                # React Query provider
│   └── page.tsx                   # Todo list demo page
└── lib/
    └── apis/                      # Auto-generated API client (run `gen` first)
```

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Development

1. Start the dev server: `pnpm dev`
2. Visit `http://localhost:3000`
3. The page demonstrates CRUD operations on todos
4. Run `pnpm gen:fetch` to regenerate API client when API changes

## Notes

- The storage uses `@aipt/utils` which automatically uses memory storage on the server
- Data is not persisted between server restarts (in-memory storage)
- For production, replace with a real database
