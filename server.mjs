import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.ico': 'image/x-icon'
};

const server = createServer(async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch {
    res.writeHead(400).end('Bad request');
    return;
  }
  const localPath = resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
  if (!localPath.startsWith(`${root}${sep}`) || /(^|[\\/])\./.test(localPath.slice(root.length))) {
    res.writeHead(403).end('Forbidden');
    return;
  }

  const extension = extname(localPath);
  if (!mime[extension]) {
    res.writeHead(404).end('Not found');
    return;
  }
  try {
    if (!(await stat(localPath)).isFile()) throw new Error('Not a file');
    const data = await readFile(localPath);
    res.writeHead(200, { 'Content-Type': mime[extension], 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    res.end(req.method === 'HEAD' ? undefined : data);
  } catch {
    res.writeHead(404).end('Not found');
  }
});

const port = Number(process.env.PORT) || 4173;
server.listen(port, '127.0.0.1', () => {
  console.log(`TeleGhost is running at http://127.0.0.1:${port}`);
});
