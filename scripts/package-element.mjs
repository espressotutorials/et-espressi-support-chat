import { copyFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const output = 'dist/support-chat-element/browser';
const loader = `(() => {\n  const current = document.currentScript;\n  const main = document.createElement('script');\n  main.src = new URL('main.js', current.src).href;\n  main.onerror = () => console.error('Espresso Support Chat failed to load.');\n  document.head.appendChild(main);\n})();\n`;
await writeFile(join(output, 'espresso-support-chat.element.js'), loader);
await copyFile('projects/support-chat-element/package.json', 'dist/support-chat-element/package.json');
await copyFile('projects/support-chat-element/README.md', 'dist/support-chat-element/README.md');
await copyFile('LICENSE', 'dist/support-chat-element/LICENSE');
