const { execSync } = require('child_process');
const commitAnalyzer = require('@semantic-release/commit-analyzer');
const releaseNotesGenerator = require('@semantic-release/release-notes-generator');

function getMobileCommitHashes(fromHash) {
  const range = fromHash ? `${fromHash}..HEAD` : 'HEAD';
  try {
    const stdout = execSync(`git log ${range} --format="%H" -- mobile-app scripts mobile-release.config.cjs`, {
      encoding: 'utf8',
      stdio: 'pipe'
    });
    return new Set(stdout.trim().split('\n').map(h => h.trim()).filter(Boolean));
  } catch (error) {
    const stderr = error.stderr ? error.stderr.toString().trim() : '';
    console.warn(
      `[mobile-release] Warning: Failed to retrieve git commit hashes for range "${range}": ${stderr || error.message}`
    );
    return new Set();
  }
}

async function analyzeCommits(pluginConfig, context) {
  const hashes = getMobileCommitHashes(context.lastRelease?.gitHead);
  const filteredCommits = (context.commits || []).filter(c => {
    const hash = c.hash || c.commit?.long || c.commit?.short;
    return hashes.has(hash);
  });

  context.logger.log(
    `[mobile-release] Scoped commits: ${filteredCommits.length} commit(s) touch mobile-app out of ${(context.commits || []).length} total commits`
  );

  if (filteredCommits.length === 0) {
    return null;
  }

  return commitAnalyzer.analyzeCommits(pluginConfig, { ...context, commits: filteredCommits });
}

async function generateNotes(pluginConfig, context) {
  const hashes = getMobileCommitHashes(context.lastRelease?.gitHead);
  const filteredCommits = (context.commits || []).filter(c => {
    const hash = c.hash || c.commit?.long || c.commit?.short;
    return hashes.has(hash);
  });

  return releaseNotesGenerator.generateNotes(pluginConfig, { ...context, commits: filteredCommits });
}

module.exports = {
  analyzeCommits,
  generateNotes
};
