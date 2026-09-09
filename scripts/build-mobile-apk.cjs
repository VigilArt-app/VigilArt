const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const version = process.argv[2];
const channel = process.argv[3] || '';

if (!version) {
  console.error('Error: Version argument is required for build-mobile-apk.cjs');
  process.exit(1);
}

if (!/^[0-9A-Za-z.\-+]+$/.test(version)) {
  console.error(`Error: Invalid version format: "${version}"`);
  process.exit(1);
}

const isDev = channel === 'dev' || version.includes('-dev') || version === 'dev';
const flavor = isDev ? 'dev' : 'prod';
const runNumber = /^[0-9]+$/.test(process.env.GITHUB_RUN_NUMBER || '') ? process.env.GITHUB_RUN_NUMBER : '1';
const apkTargetName = isDev
  ? (version === 'dev' ? 'vigilart-dev.apk' : `vigilart-dev-v${version}.apk`)
  : `vigilart-v${version}.apk`;

console.log(
  `[build-mobile-apk] Building mobile APK for version ${version} (flavor: ${flavor}, build-number: ${runNumber}, channel: ${channel || 'prod'})...`
);

const mobileAppDir = path.resolve(__dirname, '..', 'mobile-app');

const flutterArgs = [
  'build',
  'apk',
  '--release',
  `--flavor=${flavor}`,
  `--build-name=${version}`,
  `--build-number=${runNumber}`
];

console.log(`[build-mobile-apk] Executing: flutter ${flutterArgs.join(' ')}`);
execFileSync('flutter', flutterArgs, { cwd: mobileAppDir, stdio: 'inherit' });

const apkDir = path.join(mobileAppDir, 'build', 'app', 'outputs', 'flutter-apk');
const flavorApk = path.join(apkDir, `app-${flavor}-release.apk`);
const defaultApk = path.join(apkDir, 'app-release.apk');
const builtApk = fs.existsSync(flavorApk) ? flavorApk : (fs.existsSync(defaultApk) ? defaultApk : null);

if (!builtApk) {
  console.error(`Error: Built APK not found at expected location (${flavorApk} or ${defaultApk})`);
  process.exit(1);
}

// Clean up any existing vigilart-*.apk to avoid duplicate/stale assets
if (fs.existsSync(apkDir)) {
  const existingApks = fs.readdirSync(apkDir).filter(f => f.startsWith('vigilart-') && f.endsWith('.apk'));
  for (const f of existingApks) {
    fs.unlinkSync(path.join(apkDir, f));
  }
}

const targetApk = path.join(apkDir, apkTargetName);
fs.copyFileSync(builtApk, targetApk);
console.log(`[build-mobile-apk] Successfully created APK asset: ${targetApk}`);

// If building for dev, also ensure a fixed vigilart-dev.apk exists for rolling releases
if (isDev) {
  const genericDevApk = path.join(apkDir, 'vigilart-dev.apk');
  if (targetApk !== genericDevApk) {
    fs.copyFileSync(builtApk, genericDevApk);
    console.log(`[build-mobile-apk] Successfully created rolling dev APK asset: ${genericDevApk}`);
  }
}
