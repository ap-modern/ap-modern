# Storage API Documentation

The `@aipt/utils` package provides a unified storage solution that works seamlessly across browser and server environments.

## Overview

The storage module provides:

- **Unified API** for client and server-side storage
- **Automatic fallback** to memory storage on the server
- **Prefix support** to avoid key collisions
- **Type-safe** storage operations
- **Built on localforage** for browser storage (IndexedDB, WebSQL, localStorage fallback)

## Installation

```bash
npm install @aipt/utils
```

## Basic Usage

### Import

```tsx
import { storage } from '@aipt/utils';
```

### Set Item

```tsx
// Store any serializable value
await storage.setItem('user', { id: 1, name: 'John' });
await storage.setItem('token', 'abc123');
await storage.setItem('count', 42);
```

### Get Item

```tsx
// Get with type safety
const user = await storage.getItem<{ id: number; name: string }>('user');
const token = await storage.getItem<string>('token');
const count = await storage.getItem<number>('count');

if (user) {
  console.log(user.name); // TypeScript knows the type
}
```

### Remove Item

```tsx
await storage.removeItem('user');
```

### Clear All

```tsx
await storage.clear();
```

## Server-Side Support

The storage module automatically uses **memory storage** when running on the server (Node.js), ensuring your code works in both environments without changes.

### How It Works

- **Browser**: Uses IndexedDB (with fallback to WebSQL/localStorage)
- **Server**: Uses in-memory Map storage

```tsx
// This works the same in browser and server
await storage.setItem('key', 'value');
const value = await storage.getItem('key');
```

### Server-Side Example (Next.js)

```tsx
// app/api/todos/route.ts
import { storage } from '@aipt/utils';

export async function GET() {
  // Works on server - uses memory storage
  const todos = (await storage.getItem('todos')) || [];
  return Response.json(todos);
}

export async function POST(request: Request) {
  const todo = await request.json();
  const todos = (await storage.getItem('todos')) || [];
  todos.push(todo);
  await storage.setItem('todos', todos);
  return Response.json(todo);
}
```

## Advanced Usage

### Custom Prefix

Create a storage instance with a custom prefix:

```tsx
import { StorageManager } from '@aipt/utils';

const customStorage = new StorageManager('myapp_');

await customStorage.setItem('key', 'value');
// Stored as 'myapp_key'
```

### Batch Operations

```tsx
// Set multiple items
await storage.setItems({
  user: { id: 1, name: 'John' },
  token: 'abc123',
  settings: { theme: 'dark' },
});

// Get multiple items
const items = await storage.getItems<{ id: number }>(['user', 'settings']);
// Returns: { user: {...}, settings: {...} }
```

### Check if Key Exists

```tsx
const exists = await storage.hasItem('user');
if (exists) {
  // Key exists
}
```

### Get All Keys

```tsx
const keys = await storage.keys();
// Returns array of keys (without prefix)
console.log(keys); // ['user', 'token', 'settings']
```

### Get Storage Count

```tsx
const count = await storage.length();
console.log(`Stored ${count} items`);
```

## Storage Drivers

### Browser

The storage module uses **localforage** which automatically selects the best available storage:

1. **IndexedDB** (preferred) - Modern, async, large storage
2. **WebSQL** (fallback) - Legacy browser support
3. **localStorage** (fallback) - Universal support

### Server

Uses a custom **memory driver** that stores data in a Map:

- Data is lost when the process restarts
- Perfect for server-side rendering and API routes
- No persistence needed for temporary data

## Type Safety

All storage operations are type-safe:

```tsx
interface User {
  id: number;
  name: string;
  email: string;
}

// TypeScript enforces the type
const user = await storage.getItem<User>('user');
if (user) {
  console.log(user.email); // TypeScript knows user has 'email'
}
```

## Error Handling

Storage operations may throw errors. Always handle them:

```tsx
try {
  await storage.setItem('key', 'value');
} catch (error) {
  console.error('Storage error:', error);
  // Handle quota exceeded, permission denied, etc.
}
```

## Examples

### Authentication Token Storage

```tsx
import { storage } from '@aipt/utils';

// Store token
await storage.setItem('authToken', 'bearer-token-here');

// Retrieve token
const token = await storage.getItem<string>('authToken');
if (token) {
  // Use token for API requests
}
```

### User Preferences

```tsx
interface Preferences {
  theme: 'light' | 'dark';
  language: string;
  notifications: boolean;
}

// Save preferences
const preferences: Preferences = {
  theme: 'dark',
  language: 'en',
  notifications: true,
};
await storage.setItem('preferences', preferences);

// Load preferences
const saved = await storage.getItem<Preferences>('preferences');
```

### Todo List (Server-Side)

```tsx
// Next.js API route
import { storage } from '@aipt/utils';

interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

export async function GET() {
  const todos = (await storage.getItem<Todo[]>('todos')) || [];
  return Response.json(todos);
}

export async function POST(request: Request) {
  const todo: Todo = await request.json();
  const todos = (await storage.getItem<Todo[]>('todos')) || [];
  todos.push(todo);
  await storage.setItem('todos', todos);
  return Response.json(todo);
}
```

## Best Practices

1. **Always use async/await** - Storage operations are asynchronous
2. **Handle null values** - `getItem` returns `null` if key doesn't exist
3. **Use TypeScript types** - Leverage type safety for stored data
4. **Check for existence** - Use `hasItem` before accessing critical data
5. **Clear sensitive data** - Remove tokens and user data on logout

## Limitations

### Server-Side

- Data is **not persisted** - lost on process restart
- **Not shared** across multiple server instances
- Use for temporary data, caching, or SSR state only

### Browser

- **Quota limits** apply (varies by browser, typically 5-10MB)
- **Synchronous operations** are not supported (always async)
- **Cross-origin** restrictions apply

## Migration from localStorage

If you're migrating from `localStorage`, the API is very similar:

```tsx
// Old way (localStorage)
localStorage.setItem('key', 'value');
const value = localStorage.getItem('key');

// New way (@aipt/utils)
await storage.setItem('key', 'value');
const value = await storage.getItem('key');
```

The main differences:

- All operations are **async**
- Supports **complex objects** (not just strings)
- Works on **server-side** automatically
- **Type-safe** with TypeScript
