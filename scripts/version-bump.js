#!/usr/bin/env node

/**
 * Script to automatically bump version of dependent packages
 * when a package version changes in a monorepo
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

function readPackageJson(packagePath) {
  const content = readFileSync(packagePath, 'utf-8');
  return JSON.parse(content);
}

function writePackageJson(packagePath, pkg) {
  writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
}

function getPackageName(pkg) {
  return pkg.name;
}

function getPackageVersion(pkg) {
  return pkg.version;
}

function findDependentPackages(packageName, allPackages) {
  const dependents = [];
  for (const [path, pkg] of allPackages) {
    const deps = {
      ...pkg.dependencies,
      ...pkg.devDependencies,
      ...pkg.peerDependencies,
    };
    if (deps[packageName]) {
      dependents.push(path);
    }
  }
  return dependents;
}

function bumpVersion(version, type = 'patch') {
  const [major, minor, patch] = version.split('.').map(Number);
  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
    default:
      return `${major}.${minor}.${patch + 1}`;
  }
}

async function main() {
  const packagePaths = await glob('packages/*/package.json', {
    cwd: rootDir,
    absolute: true,
  });

  const allPackages = new Map();
  for (const path of packagePaths) {
    const pkg = readPackageJson(path);
    allPackages.set(path, pkg);
  }

  // Read all package.json files
  const packages = Array.from(allPackages.entries()).map(([path, pkg]) => ({
    path,
    name: getPackageName(pkg),
    version: getPackageVersion(pkg),
    pkg,
  }));

  console.log('Checking for version updates...');

  // For each package, check if any dependents need version bumps
  for (const { path, name, version, pkg } of packages) {
    const dependents = findDependentPackages(name, allPackages);
    if (dependents.length > 0) {
      console.log(`\nPackage ${name}@${version} has ${dependents.length} dependent(s):`);
      for (const depPath of dependents) {
        const depPkg = allPackages.get(depPath);
        const depName = getPackageName(depPkg);
        const currentDepVersion = getPackageVersion(depPkg);
        const newDepVersion = bumpVersion(currentDepVersion, 'patch');
        console.log(`  - ${depName}: ${currentDepVersion} -> ${newDepVersion}`);
        depPkg.version = newDepVersion;
        writePackageJson(depPath, depPkg);
      }
    }
  }

  console.log('\nVersion bumping complete!');
}

main().catch(console.error);
