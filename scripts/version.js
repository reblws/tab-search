#!/usr/bin/env node

/**
 * Version bump script for TabSearch extension.
 *
 * Usage:
 *   node scripts/version.js <major|minor|patch|x.y.z>
 *
 * Examples:
 *   node scripts/version.js patch     # 0.5.0 -> 0.5.1
 *   node scripts/version.js minor     # 0.5.0 -> 0.6.0
 *   node scripts/version.js major     # 0.5.0 -> 1.0.0
 *   node scripts/version.js 1.2.3     # Set explicit version
 */

const { readJsonSync, outputJsonSync } = require('fs-extra');
const { execSync } = require('child_process');
const { resolve } = require('path');

const MANIFEST_PATH = resolve(__dirname, '../src/manifest/base.json');

function parseVersion(version) {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!match) {
    throw new Error(`Invalid version format: ${version}`);
  }
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
  };
}

function formatVersion({ major, minor, patch }) {
  return `${major}.${minor}.${patch}`;
}

function bumpVersion(current, type) {
  const parsed = parseVersion(current);

  switch (type) {
    case 'major':
      return formatVersion({ major: parsed.major + 1, minor: 0, patch: 0 });
    case 'minor':
      return formatVersion({ major: parsed.major, minor: parsed.minor + 1, patch: 0 });
    case 'patch':
      return formatVersion({ major: parsed.major, minor: parsed.minor, patch: parsed.patch + 1 });
    default:
      // Assume it's an explicit version
      parseVersion(type); // Validate format
      return type;
  }
}

function run(cmd) {
  return execSync(cmd, { encoding: 'utf8', stdio: 'inherit' });
}

function main() {
  const arg = process.argv[2];

  if (!arg) {
    console.error('Usage: npm run version <major|minor|patch|x.y.z>');
    process.exit(1);
  }

  // Read current manifest
  const manifest = readJsonSync(MANIFEST_PATH);
  const currentVersion = manifest.version;

  // Calculate new version
  const newVersion = bumpVersion(currentVersion, arg);

  if (newVersion === currentVersion) {
    console.log(`Version is already ${currentVersion}`);
    process.exit(0);
  }

  console.log(`Bumping version: ${currentVersion} -> ${newVersion}`);

  // Update manifest
  manifest.version = newVersion;
  outputJsonSync(MANIFEST_PATH, manifest, { spaces: 2 });
  console.log(`Updated ${MANIFEST_PATH}`);

  // Git commit and tag
  const tagName = `v${newVersion}`;
  run(`git add ${MANIFEST_PATH}`);
  run(`git commit -m "${tagName}"`);
  run(`git tag -a ${tagName} -m "${tagName}"`);

  console.log(`\nCreated commit and tag: ${tagName}`);
  console.log('Run "git push && git push --tags" to publish');
}

main();
