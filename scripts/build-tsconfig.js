#!/usr/bin/env node

/**
 * Script to build/validate tsconfig.build.json for all packages
 */

import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

function readJsonFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    return null;
  }
}

function writeJsonFile(filePath, data) {
  writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

function getPackageDependencies(packagePath) {
  const pkg = readJsonFile(packagePath);
  if (!pkg) return [];

  const deps = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
    ...pkg.peerDependencies,
  };

  const workspaceDeps = [];
  for (const [depName, depVersion] of Object.entries(deps)) {
    if (depVersion === 'workspace:*' && depName.startsWith('@aipt/')) {
      workspaceDeps.push(depName);
    }
  }
  return workspaceDeps;
}

function getPackageNameFromPath(packagePath) {
  const pkg = readJsonFile(packagePath);
  return pkg?.name || null;
}

function findPackagePath(packageName, allPackages) {
  for (const [path, name] of allPackages) {
    if (name === packageName) {
      return path;
    }
  }
  return null;
}

function getRelativePath(from, to) {
  const fromDir = dirname(from);
  const relative = join(fromDir, to).replace(/\\/g, '/');
  return relative;
}

async function buildTsconfigBuildJson() {
  console.log('Building tsconfig.build.json files...\n');

  // Find all package.json files in packages
  const packagePaths = await glob(['packages/*/package.json'], {
    cwd: rootDir,
    absolute: true,
  });

  // Build package name map
  const packageMap = new Map();
  for (const packagePath of packagePaths) {
    const pkg = readJsonFile(packagePath);
    if (pkg?.name) {
      packageMap.set(packagePath, pkg.name);
    }
  }

  let created = 0;
  let updated = 0;

  for (const packagePath of packagePaths) {
    const packageDir = dirname(packagePath);
    const tsconfigBuildPath = join(packageDir, 'tsconfig.build.json');
    const tsconfigPath = join(packageDir, 'tsconfig.json');

    // Get dependencies
    const dependencies = getPackageDependencies(packagePath);
    const references = [];

    // Build references from dependencies
    for (const depName of dependencies) {
      // Find the package path for this dependency
      for (const [depPath, depPackageName] of packageMap.entries()) {
        if (depPackageName === depName) {
          const depDir = dirname(depPath);
          // Calculate relative path from current package to dependency
          const relativePath = relative(packageDir, depDir).replace(/\\/g, '/');
          references.push({ path: relativePath });
          break;
        }
      }
    }

    // Check if this package is referenced by other packages
    // If it is, its tsconfig.json must have composite: true (TypeScript requirement for references)
    let isReferenced = false;
    for (const [otherPackagePath, otherPackageName] of packageMap.entries()) {
      if (otherPackagePath === packagePath) continue;
      const otherPackageDeps = getPackageDependencies(otherPackagePath);
      const currentPackageName = getPackageNameFromPath(packagePath);
      if (currentPackageName && otherPackageDeps.includes(currentPackageName)) {
        isReferenced = true;
        break;
      }
    }

    // Read existing tsconfig.build.json if it exists to preserve tsBuildInfoFile
    const existingBuildConfig = existsSync(tsconfigBuildPath)
      ? readJsonFile(tsconfigBuildPath)
      : null;
    const existingTsBuildInfoFile = existingBuildConfig?.compilerOptions?.tsBuildInfoFile;

    // Build tsconfig.build.json
    const tsconfigBuild = {
      extends: './tsconfig.json',
      compilerOptions: {
        outDir: './dist',
        rootDir: './src',
        noEmit: false,
        tsBuildInfoFile: existingTsBuildInfoFile || '.tsbuildinfo/tsconfig.build.tsbuildinfo',
        composite: true,
        declaration: true,
        declarationMap: true,
        sourceMap: true,
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist', 'test', 'e2etest', '**/*.test.ts', '**/*.spec.ts'],
      ...(references.length > 0 && { references }),
    };

    // Ensure tsconfig.json has correct composite setting:
    // - If this package is referenced by others, it MUST have composite: true (TypeScript requirement)
    // - If this package references others, it should NOT have composite (uses paths instead)
    const tsconfig = readJsonFile(tsconfigPath);
    let tsconfigNeedsUpdate = false;
    const currentComposite = tsconfig?.compilerOptions?.composite || false;

    if (isReferenced && !currentComposite) {
      // Package is referenced by others, must have composite: true
      if (!tsconfig.compilerOptions) {
        tsconfig.compilerOptions = {};
      }
      tsconfig.compilerOptions.composite = true;
      tsconfigNeedsUpdate = true;
      console.log(`✅ Adding composite to ${tsconfigPath} (package is referenced by others)`);
    } else if (!isReferenced && currentComposite && references.length === 0) {
      // Package is not referenced and doesn't reference others, remove composite
      delete tsconfig.compilerOptions.composite;
      tsconfigNeedsUpdate = true;
      console.log(`⚠️  Removing composite from ${tsconfigPath} (not needed, uses paths instead)`);
    }

    // Check if file exists and compare configurations
    const exists = existsSync(tsconfigBuildPath);
    if (exists) {
      const existing = readJsonFile(tsconfigBuildPath);
      // Check if references or composite setting changed
      const existingRefs = JSON.stringify(existing?.references || []);
      const newRefs = JSON.stringify(references);
      const existingComposite = existing?.compilerOptions?.composite || false;
      const newComposite = tsconfigBuild.compilerOptions?.composite || false;
      const existingTsBuildInfoFile = existing?.compilerOptions?.tsBuildInfoFile;
      const newTsBuildInfoFile = tsconfigBuild.compilerOptions.tsBuildInfoFile;

      // Check if any important config changed
      const configChanged =
        existingRefs !== newRefs ||
        existingComposite !== newComposite ||
        existingTsBuildInfoFile !== newTsBuildInfoFile;

      if (configChanged || tsconfigNeedsUpdate) {
        if (configChanged) {
          writeJsonFile(tsconfigBuildPath, tsconfigBuild);
          updated++;
          console.log(`✅ Updated: ${tsconfigBuildPath}`);
        }
        if (tsconfigNeedsUpdate) {
          writeJsonFile(tsconfigPath, tsconfig);
        }
      }
    } else {
      writeJsonFile(tsconfigBuildPath, tsconfigBuild);
      created++;
      console.log(`✅ Created: ${tsconfigBuildPath}`);
      if (tsconfigNeedsUpdate) {
        writeJsonFile(tsconfigPath, tsconfig);
      }
    }
  }

  console.log(`\n✨ Done! Created: ${created}, Updated: ${updated}`);

  // Build TypeScript project references to generate .tsbuildinfo files
  console.log('\nBuilding TypeScript project references...\n');

  const buildOrder = [];
  const processed = new Set();

  // Topological sort: build dependencies first
  function addToBuildOrder(packagePath) {
    if (processed.has(packagePath)) {
      return;
    }

    const packageDir = dirname(packagePath);
    const tsconfigBuildPath = join(packageDir, 'tsconfig.build.json');

    if (!existsSync(tsconfigBuildPath)) {
      return;
    }

    const tsconfigBuild = readJsonFile(tsconfigBuildPath);
    const references = tsconfigBuild?.references || [];

    // First process dependencies
    for (const ref of references) {
      const refPath = join(packageDir, ref.path);
      const refPackageJson = join(refPath, 'package.json');
      if (existsSync(refPackageJson)) {
        addToBuildOrder(refPackageJson);
      }
    }

    processed.add(packagePath);
    buildOrder.push(packageDir);
  }

  // Build dependency order
  for (const packagePath of packagePaths) {
    addToBuildOrder(packagePath);
  }

  // Find TypeScript executable
  const tscPath = join(rootDir, 'node_modules', '.bin', 'tsc');
  const useTsc = existsSync(tscPath) ? tscPath : 'tsc';

  // Compile each project in order (only composite projects generate .tsbuildinfo)
  let compiled = 0;
  let failed = 0;
  for (const packageDir of buildOrder) {
    const tsconfigBuildPath = join(packageDir, 'tsconfig.build.json');
    if (existsSync(tsconfigBuildPath)) {
      const tsconfigBuild = readJsonFile(tsconfigBuildPath);
      // Only compile composite projects (they generate .tsbuildinfo)
      if (tsconfigBuild?.compilerOptions?.composite) {
        try {
          const relativePath = packageDir.replace(rootDir, '') || '.';
          console.log(`📦 Compiling: ${relativePath}`);
          // Use --force to rebuild even if files haven't changed
          execSync(`${useTsc} -b --force ${tsconfigBuildPath}`, {
            cwd: rootDir,
            stdio: 'pipe',
          });
          compiled++;
        } catch (error) {
          failed++;
          const relativePath = packageDir.replace(rootDir, '') || '.';
          console.error(`❌ Failed to compile: ${relativePath}`);
          // Continue with other packages even if one fails
        }
      }
    }
  }

  if (failed > 0) {
    console.log(
      `\n⚠️  TypeScript compilation completed with errors. Compiled: ${compiled}, Failed: ${failed}`
    );
  } else {
    console.log(`\n✨ TypeScript compilation complete! Compiled: ${compiled} projects`);
  }
}

buildTsconfigBuildJson().catch((error) => {
  console.error('Error building tsconfig.build.json:', error);
  process.exit(1);
});
