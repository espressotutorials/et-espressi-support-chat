import { createReadStream, existsSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';

const root = resolve('examples/vanilla-html');
const assets = resolve('dist/support-chat-element/browser');
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' };
const port = Number(process.env.PORT || 4200);

createServer((request, response) => {
  const pathname = new URL(request.url || '/', 'http://localhost').pathname;
  const base = pathname.startsWith('/assets/') ? assets : root;
  const relative = pathname.startsWith('/assets/') ? pathname.slice('/assets/'.length) : pathname === '/' ? 'index.html' : pathname.slice(1);
  const file = resolve(base, relative);
  if (!file.startsWith(base + sep) || !existsSync(file)) {
    response.writeHead(404).end('Not found');
    return;
  }
  response.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  createReadStream(file).pipe(response);
}).listen(port, '127.0.0.1', () => console.log(`Support Chat demo: http://127.0.0.1:${port}`));
