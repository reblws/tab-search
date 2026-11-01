// Copies of the built extension for the E2E tests, with host access to the
// local fixture server the overlay specs use.
//
// The overlay normally gets into a tab through activeTab, which only a real
// click on the toolbar button (or its shortcut) grants, and WebDriver can't
// press either. With this one extra origin the specs can open the overlay
// through the background's TabSearchOverlay.open(), the same code a click
// runs. Nothing else in the copies changes.
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const FIXTURE_ORIGIN = 'http://127.0.0.1/*';

async function copyWithHostAccess(sourceDir, targetDir) {
  await fs.rm(targetDir, { recursive: true, force: true });
  await fs.cp(sourceDir, targetDir, { recursive: true });
  const manifestPath = path.join(targetDir, 'manifest.json');
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  if (manifest.manifest_version === 3) {
    manifest.host_permissions = [...(manifest.host_permissions || []), FIXTURE_ORIGIN];
  } else {
    manifest.permissions = [...(manifest.permissions || []), FIXTURE_ORIGIN];
  }
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  return targetDir;
}

// Unpacked Chrome copy of dist/
export function prepareChromeExtension() {
  return copyWithHostAccess(path.join(root, 'dist'), path.join(root, '.e2e', 'chrome'));
}

// Zipped Firefox copy of the built zip's contents (dist/ after zip:firefox),
// as base64 for browser.installAddOn()
export async function prepareFirefoxExtension() {
  const sourceDir = await copyWithHostAccess(path.join(root, 'dist'), path.join(root, '.e2e', 'firefox'));
  const artifactsDir = path.join(root, '.e2e', 'firefox-artifacts');
  const { default: webExt } = await import('web-ext');
  const { extensionPath } = await webExt.cmd.build(
    { sourceDir, artifactsDir, overwriteDest: true, filename: 'tabsearch-e2e.zip' },
    { shouldExitProgram: false },
  );
  return (await fs.readFile(extensionPath)).toString('base64');
}
