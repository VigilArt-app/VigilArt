module.exports = {
  branches: [
    'main',
    { name: 'dev', prerelease: 'dev' }
  ],
  tagFormat: 'mobile-v${version}',
  plugins: [
    [
      './scripts/semantic-release-mobile-filter.cjs',
      {
        preset: 'conventionalcommits',
        releaseRules: [
          { type: 'feat', release: 'minor' },
          { type: 'fix', release: 'patch' },
          { type: 'hotfix', release: 'patch' },
          { type: 'perf', release: 'patch' },
          { type: 'refactor', release: 'patch' },
          { breaking: true, release: 'major' }
        ]
      }
    ],
    [
      '@semantic-release/exec',
      {
        prepareCmd: 'node scripts/build-mobile-apk.cjs ${nextRelease.version} "${nextRelease.channel || ""}"'
      }
    ],
    [
      '@semantic-release/github',
      {
        assets: [
          {
            path: 'mobile-app/build/app/outputs/flutter-apk/vigilart-*.apk',
            label: 'VigilArt Android APK'
          }
        ]
      }
    ]
  ]
};
