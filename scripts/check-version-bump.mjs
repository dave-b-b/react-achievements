/* global process, console */

import { execFileSync } from 'node:child_process';

const [base, head = 'HEAD'] = process.argv.slice(2);
if (!base) {
  console.error('Usage: node scripts/check-version-bump.mjs <base> [head]');
  process.exit(2);
}

const changed = execFileSync('git', ['diff', '--name-only', base, head], { encoding: 'utf8' })
  .trim()
  .split('\n')
  .filter(Boolean);
const packageRelevant = changed.some((file) =>
  file === 'package.json' ||
  file === 'package-lock.json' ||
  file.startsWith('src/') ||
  file === 'scripts/build.mjs'
);

if (!packageRelevant) {
  console.log('No package-relevant changes; a version bump is not required.');
  process.exit(0);
}

const show = (revision, file) => execFileSync('git', ['show', `${revision}:${file}`], { encoding: 'utf8' });
const previous = JSON.parse(show(base, 'package.json'));
const current = JSON.parse(show(head, 'package.json'));
const lock = JSON.parse(show(head, 'package-lock.json'));

const parseVersion = (version) => {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  return match ? match.slice(1).map(Number) : null;
};
const before = parseVersion(previous.version);
const after = parseVersion(current.version);
if (!after || !before || after.every((part, index) => part === before[index])) {
  throw new Error(`package.json must bump semver version (${previous.version} -> ${current.version})`);
}
if (after[0] < before[0] || (after[0] === before[0] && after[1] < before[1]) ||
    (after[0] === before[0] && after[1] === before[1] && after[2] < before[2])) {
  throw new Error(`package.json version must increase (${previous.version} -> ${current.version})`);
}
if (lock.version !== current.version || lock.packages?.['']?.version !== current.version) {
  throw new Error('package-lock.json root versions must match package.json');
}
console.log(`Version bump valid: ${previous.version} -> ${current.version}`);
