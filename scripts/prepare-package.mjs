import { copyFile } from 'node:fs/promises';

await copyFile('README.md', 'projects/support-chat/README.md');
await copyFile('LICENSE', 'projects/support-chat/LICENSE');
