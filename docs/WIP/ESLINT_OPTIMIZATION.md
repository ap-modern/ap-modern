# ESLint Performance Optimization Guide

## When to Enable Optimization

### Current Project Status Check

Run the following commands to check ESLint performance:

```bash
# Check project file count
find packages examples -name "*.ts" -o -name "*.tsx" | wc -l

# Test ESLint runtime
time pnpm lint
```

### Conditions for Enabling Optimization

| Metric          | Current Config | Optimized Config |
| --------------- | -------------- | ---------------- |
| File Count      | < 500          | > 500            |
| ESLint Runtime  | < 10 seconds   | > 10 seconds     |
| Team Size       | Small team     | Large team       |
| CI/CD Frequency | Low            | High             |

## Enable Optimization Steps

### Step 1: Update ESLint Configuration

Edit `.eslintrc.json`:

```json
{
  "parserOptions": {
    "project": "./tsconfig.eslint.json" // Change to use optimized config
  }
}
```

### Step 2: First Run to Generate Cache

```bash
pnpm lint
```

This will generate the `.eslintcache/tsconfig.tsbuildinfo` file.

### Step 3: Verify Performance Improvement

```bash
# Run again, should be noticeably faster
time pnpm lint
```

## Performance Monitoring

### Benchmark Testing

```bash
# Clear cache
rm -rf .eslintcache

# Test first run (no cache)
time pnpm lint

# Test subsequent runs (with cache)
time pnpm lint
```

### Expected Performance Improvement

- **Small Projects (< 100 files)**: 20-30% improvement
- **Medium Projects (100-500 files)**: 50-60% improvement
- **Large Projects (> 500 files)**: 70-75% improvement

## Notes

1. **Cache Location**: `.eslintcache/` directory has been added to `.gitignore`
2. **Cache Invalidation**: Need to clear cache after modifying `tsconfig.eslint.json`
3. **CI/CD**: First run in CI environment will be slower, subsequent runs will utilize cache

## Rollback Plan

If issues occur after optimization, you can rollback at any time:

```json
{
  "parserOptions": {
    "project": "./tsconfig.json" // Revert to original config
  }
}
```
