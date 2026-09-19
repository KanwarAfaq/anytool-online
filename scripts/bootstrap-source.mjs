import { readFile, writeFile, readdir, rm } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

const root = process.cwd();
const dir = resolve(root, 'bootstrap');
let parts;
try {
  parts = (await readdir(dir)).filter((name) => /^part\d+$/.test(name)).sort();
} catch {
  process.exit(0);
}
if (!parts.length) process.exit(0);

const chunks = [];
for (const part of parts) chunks.push(await readFile(resolve(dir, part), 'utf8'));
const archive = resolve(root, '.anytool-source.tgz');
await writeFile(archive, Buffer.from(chunks.join(''), 'base64'));
execFileSync('tar', ['-xzf', archive, '-C', root], { stdio: 'inherit' });
await rm(archive, { force: true });
console.log('Expanded AnyTool production source.');
