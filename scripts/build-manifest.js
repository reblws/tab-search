#!/usr/bin/env node

// This script accepts a browser (firefox/chrome) as the first arg and saves the
// manifest.json file to the dist folder specified in the second arg
// eslint-disable-next-line
const { outputJsonSync } = require('fs-extra');
const { join, resolve } = require('path');
const baseManifest = require('../src/manifest/base.json');

// Deep merge function to properly combine nested objects
function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      target[key] &&
      typeof target[key] === 'object' &&
      !Array.isArray(target[key])
    ) {
      result[key] = deepMerge(target[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

const targetBrowser = process.argv[2];
const destPath = resolve(join(process.argv[3]), 'manifest.json');
let manifest;
switch (targetBrowser) {
  case 'firefox':
    manifest = deepMerge(baseManifest, require('../src/manifest/firefox.json'));
    break;
  case 'chrome':
    manifest = deepMerge(baseManifest, require('../src/manifest/chrome.json'));
    break;
  default:
    throw new Error('Invalid targetBrowser!');
}


outputJsonSync(destPath, manifest, { spaces: 2 });
console.log('Done writing manifest.json');
console.log(`Saved in ${destPath}`);
