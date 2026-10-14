import { readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

const [releaseType] = process.argv.slice(2);
const releaseTypes = new Set(['patch', 'minor', 'major']);

if (!releaseTypes.has(releaseType)) {
  console.error('Usage: npm run release -- <patch|minor|major>');
  process.exit(1);
}

const run = (command, args) => execFileSync(command, args, { encoding: 'utf8', stdio: 'inherit' });
const gitOutput = (args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
const status = gitOutput(['status', '--porcelain']);
if (status) {
  throw new Error('Commit all changes before starting a release.');
}

const branch = gitOutput(['branch', '--show-current']);
if (!branch) {
  throw new Error('Releases must run from a branch, not a detached HEAD.');
}

const manifestPaths = [
  'package.json',
  'projects/support-chat/package.json',
  'projects/support-chat-element/package.json'
];
const manifests = await Promise.all(manifestPaths.map(async (path) => ({
  path,
  manifest: JSON.parse(await readFile(path, 'utf8'))
})));
const versions = new Set(manifests.map(({ manifest }) => manifest.version));

if (versions.size !== 1) {
  throw new Error(`Package versions are out of sync: ${[...versions].join(', ')}`);
}

const currentVersion = [...versions][0];
if (!/^\d+\.\d+\.\d+$/.test(currentVersion)) {
  throw new Error(`Expected a stable SemVer version, received ${currentVersion}.`);
}

const [major, minor, patch] = currentVersion.split('.').map(Number);
const nextVersion = releaseType === 'major'
  ? `${major + 1}.0.0`
  : releaseType === 'minor'
    ? `${major}.${minor + 1}.0`
    : `${major}.${minor}.${patch + 1}`;
const tag = `v${nextVersion}`;

if (gitOutput(['tag', '--list', tag])) {
  throw new Error(`Git tag ${tag} already exists; refusing to reuse it.`);
}

for (const { path, manifest } of manifests) {
  manifest.version = nextVersion;
  await writeFile(path, `${JSON.stringify(manifest, null, 2)}\n`);
}

const lockPath = 'package-lock.json';
const lock = JSON.parse(await readFile(lockPath, 'utf8'));
lock.version = nextVersion;
lock.packages[''].version = nextVersion;
await writeFile(lockPath, `${JSON.stringify(lock, null, 2)}\n`);

run('git', ['add', ...manifestPaths, lockPath]);
run('git', ['commit', '-m', `release: ${tag}`]);
run('git', ['tag', '-a', tag, '-m', `Release ${tag}`]);
run('git', ['push', '--atomic', 'origin', 'HEAD', `refs/tags/${tag}`]);

console.log(`Pushed ${tag}. GitHub Actions will publish the npm packages and create the GitHub Release.`);
