import { mkdtemp, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const npmCli = process.env.npm_execpath;
if (!npmCli) throw new Error('Run this check through npm so npm_execpath is available.');
const cache = await mkdtemp(join(tmpdir(), 'espresso-support-chat-pack-'));
try {
  for (const packagePath of ['./dist/support-chat', './dist/support-chat-element']) {
    const result = spawnSync(process.execPath, [npmCli, 'pack', packagePath, '--dry-run', '--cache', cache], { stdio: 'inherit' });
    if (result.error) throw result.error;
    if (result.status !== 0) process.exitCode = result.status ?? 1;
  }
} finally {
  await rm(cache, { recursive: true, force: true });
}
