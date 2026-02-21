#!/usr/bin/env node
/**
 * Fixes package-lock.json so platform-specific packages are listed as
 * optionalDependencies (not regular dependencies) at the root level.
 *
 * Without this, npm on Vercel (Linux) fails with EBADPLATFORM for
 * darwin-arm64 native binaries.
 *
 * Runs automatically via the "postinstall" script in package.json.
 */
const fs = require('fs');
const path = require('path');

const lockPath = path.join(__dirname, '..', 'package-lock.json');
if (!fs.existsSync(lockPath)) process.exit(0);

const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
const root = lock.packages[''];
if (!root) process.exit(0);

const deps = root.dependencies || {};
if (!root.optionalDependencies) root.optionalDependencies = {};

let fixed = 0;

// Move platform-specific packages from dependencies to optionalDependencies
for (const [dep, ver] of Object.entries(deps)) {
  const pkgEntry = lock.packages['node_modules/' + dep];
  if (pkgEntry && pkgEntry.os && pkgEntry.cpu) {
    delete root.dependencies[dep];
    root.optionalDependencies[dep] = ver;
    pkgEntry.optional = true;
    fixed++;
  }
}

if (fixed > 0) {
  fs.writeFileSync(lockPath, JSON.stringify(lock, null, 2) + '\n');
  console.log('fix-lockfile: moved ' + fixed + ' platform-specific package(s) to optionalDependencies');
}
