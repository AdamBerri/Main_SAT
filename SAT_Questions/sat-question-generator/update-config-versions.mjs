#!/usr/bin/env node
/**
 * Updates all config.json files to point to the highest available prompt version.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const promptsDir = path.join(__dirname, 'prompts');

function findHighestVersion(dir) {
  const files = fs.readdirSync(dir);
  const versionPattern = /^prompt_v(\d+)\.(\d+)\.(\d+)\.md$/;

  let highestVersion = null;
  let highestParts = [0, 0, 0];

  for (const file of files) {
    const match = file.match(versionPattern);
    if (match) {
      const parts = [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
      if (parts[0] > highestParts[0] ||
          (parts[0] === highestParts[0] && parts[1] > highestParts[1]) ||
          (parts[0] === highestParts[0] && parts[1] === highestParts[1] && parts[2] > highestParts[2])) {
        highestParts = parts;
        highestVersion = `${parts[0]}.${parts[1]}.${parts[2]}`;
      }
    }
  }

  return highestVersion;
}

function updateConfigFiles(baseDir) {
  const updates = [];

  function processDir(dir) {
    const configPath = path.join(dir, 'config.json');

    if (fs.existsSync(configPath)) {
      const highestVersion = findHighestVersion(dir);

      if (highestVersion) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        const oldVersion = config.currentVersion;

        if (oldVersion !== highestVersion) {
          config.currentVersion = highestVersion;
          fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');

          const relativePath = path.relative(baseDir, dir);
          updates.push({
            topic: relativePath,
            oldVersion,
            newVersion: highestVersion
          });
        }
      }
    }

    // Recurse into subdirectories
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        processDir(path.join(dir, entry.name));
      }
    }
  }

  processDir(baseDir);
  return updates;
}

console.log('Updating config.json files to highest prompt versions...\n');

const updates = updateConfigFiles(promptsDir);

if (updates.length === 0) {
  console.log('All config files already point to the highest version.');
} else {
  console.log('Updated configs:');
  console.log('================\n');

  for (const update of updates) {
    console.log(`${update.topic}`);
    console.log(`  ${update.oldVersion} -> ${update.newVersion}\n`);
  }

  console.log(`\nTotal: ${updates.length} config(s) updated.`);
}
