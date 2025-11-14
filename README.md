# AP Modern Monorepo

A modern TypeScript monorepo project with comprehensive tooling.

## Project Structure

```
.
├── packages/          # Shared packages
│   ├── utils/        # Utility functions
│   └── ui/           # UI components
├── examples/         # Example applications
│   └── basic/        # Basic example
└── ...
```

## Features

- ✅ TypeScript support with project references
- ✅ Jest for unit testing
- ✅ Playwright for E2E testing (UI components only)
- ✅ ESLint + Prettier for code quality
- ✅ Husky + lint-staged + commitlint for git hooks
- ✅ Semantic Release for automated versioning
- ✅ Changesets for version management
- ✅ Bun for building ESM and CJS formats
- ✅ Automatic version bumping for dependent packages

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Bun (optional, for building)

### Installation

```bash
pnpm install
```

### Development

```bash
# Build all packages
pnpm build

# Run tests
pnpm test

# Run E2E tests
pnpm test:e2e

# Lint code
pnpm lint

# Format code
pnpm format
```

### Working with Packages

Each package in `packages/` has:

- `src/` - Source code
- `test/` - Unit tests (Jest)
- `e2etest/` - E2E tests (Playwright, UI components only)
- `tsconfig.build.json` - Build configuration with package references

### Version Management

This project uses [Changesets](https://github.com/changesets/changesets) for version management:

```bash
# Create a changeset
pnpm changeset

# Version packages (automatically bumps dependent packages)
pnpm version-packages

# Publish packages
pnpm release-packages
```

### Semantic Release

Semantic release is configured to automatically:

- Analyze commits
- Generate changelog
- Bump versions
- Publish packages

## Configuration

- **TypeScript**: Root `tsconfig.json` with project references
- **ESLint**: `.eslintrc.json` with TypeScript support
- **Prettier**: `.prettierrc` for code formatting
- **Husky**: Git hooks in `.husky/`
- **Changesets**: `.changeset/config.json`
- **Semantic Release**: `.releaserc.json`

For detailed information, see [CONTRIBUTING.md](./CONTRIBUTING.md)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

The MIT License allows you to:

- ✅ Use the software commercially
- ✅ Modify the software
- ✅ Distribute the software
- ✅ Sublicense the software
- ✅ Use privately

The only requirement is to include the original copyright notice and license.
