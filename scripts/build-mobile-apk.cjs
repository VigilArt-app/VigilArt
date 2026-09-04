const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const version = process.argv[2];
const channel = process.argv[3] || '';

if (!version) {
  console.error('Error: Version argument is required for build-mobile-apk.cjs');
  process.exit(1);
}

const isDev = channel === 'dev' || version.includes('-dev');
const runNumber = process.env.GITHUB_RUN_NUMBER || '1';
const apkTargetName = isDev ? `vigilart-dev-v${version}.apk` : `vigilart-v${version}.apk`;

console.log(
  `[build-mobile-apk] Building mobile APK for version ${version} (build-number: ${runNumber}, channel: ${channel || 'prod'})...`
);

const mobileAppDir = path.resolve(__dirname, '..', 'mobile-app');
const cmd = `flutter build apk --release --build-name=${version} --build-number=${runNumber}`;

console.log(`[build-mobile-apk] Executing: ${cmd}`);
execSync(cmd, { cwd: mobileAppDir, stdio: 'inherit' });

const apkDir = path.join(mobileAppDir, 'build', 'app', 'outputs', 'flutter-apk');
const defaultApk = path.join(apkDir, 'app-release.apk');
const targetApk = path.join(apkDir, apkTargetName);

if (!fs.existsSync(defaultApk)) {
  console.error(`Error: Built APK not found at expected location: ${defaultApk}`);
  process.exit(1);
}

// Clean up any existing vigilart-*.apk to avoid duplicate/stale assets
if (fs.existsSync(apkDir)) {
  const existingApks = fs.readdirSync(apkDir).filter(f => f.startsWith('vigilart-') && f.endsWith('.apk'));
  for (const f of existingApks) {
    fs.unlinkSync(path.join(apkDir, f));
  }
}

fs.copyFileSync(defaultApk, targetApk);
console.log(`[build-mobile-apk] Successfully created APK asset: ${targetApk}`);
