# Contributing Guide

## Project Structure

```
ap-modern/
├── packages/              # Shared packages
│   ├── utils/            # Utility functions package
│   │   ├── src/          # Source code
│   │   ├── test/         # Unit tests
│   │   ├── tsconfig.build.json  # Build configuration (with package references)
│   │   └── package.json
│   └── ui/               # UI components package
│       ├── src/          # Source code
│       ├── test/         # Unit tests
│       ├── e2etest/      # E2E tests (UI components only)
│       ├── tsconfig.build.json  # Build configuration (with package references)
│       └── package.json
├── examples/             # Example applications
│   └── basic/           # Basic example
│       ├── src/
│       ├── tsconfig.build.json  # Build configuration (with package references)
│       └── package.json
├── scripts/              # Utility scripts
├── .changeset/           # Changesets configuration
├── .husky/               # Git hooks
└── package.json          # Root package.json
```

## Development Workflow

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Create a New Package

To create a new package in the `packages/` directory:

1. Create the package directory and basic files
2. Copy the `tsconfig.build.json` template and configure package references
3. Add dependent packages in the `references` field of `tsconfig.build.json`

Example:

```json
{
  "references": [{ "path": "../utils" }, { "path": "../other-package" }]
}
```

### 3. Write Tests

- **Unit Tests**: Place in `test/` directory, using Jest
- **E2E Tests**: Only for UI components, place in `e2etest/` directory, using Playwright

### 4. Build

```bash
# Build all packages
pnpm build

# Build a single package
cd packages/utils
pnpm build
```

Build process:

1. TypeScript compilation generates type definitions (`.d.ts`)
2. Bun builds ESM format
3. Bun builds CJS format

### 5. Version Management

Use Changesets for version management:

```bash
# Create a changeset
pnpm changeset

# Version packages (automatically bumps dependent package versions)
pnpm version-packages

# Publish packages
pnpm release-packages
```

Changesets will automatically:

- Detect dependencies between packages
- When a dependency package version is updated, automatically bump the version of packages that depend on it (according to `updateInternalDependencies: "patch"` configuration)

### 6. Commit Code

The project uses Conventional Commits specification:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation updates
- `style`: Code formatting (does not affect functionality)
- `refactor`: Refactoring
- `perf`: Performance optimization
- `test`: Test related
- `chore`: Build/tool related
- `revert`: Revert changes

Before committing, the following will run automatically:

- ESLint checks
- Prettier formatting
- Commitlint validation of commit messages

## TypeScript Configuration

### tsconfig.build.json

Each sub-project should have `tsconfig.build.json` for:

1. Referencing other packages' source code (via `references`)
2. Generating type definition files
3. Type checking during build

Key configurations:

- `references`: Declare dependencies on other packages
- `composite: true`: Enable project references
- `declaration: true`: Generate `.d.ts` files

## Testing

### Jest Configuration

Each package has its own `jest.config.js`, supporting:

- ESM modules
- TypeScript
- Source code references between packages (via `moduleNameMapper`)

### Playwright Configuration

Only UI component packages need E2E tests:

- Test files are placed in `e2etest/` directory
- Use `@playwright/test`
- Configuration is in the package's `playwright.config.ts`

## Build

Using Bun for building, supporting:

- ESM format: `dist/index.js`
- CJS format: `dist/index.cjs`
- Type definitions: `dist/index.d.ts`

Build commands will:

1. First run TypeScript compilation to generate type definitions
2. Then use Bun to build both formats of JS files

## Version Bump Mechanism

When package A depends on package B:

- If package B's version is updated (major/minor/patch)
- Changesets will automatically bump package A's version by a corresponding patch version
- This is implemented through the `updateInternalDependencies: "patch"` configuration in `.changeset/config.json`
