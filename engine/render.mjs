// usage: node render.mjs spec.json out.mp4 [startFrame] [endFrame]
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { spawn } from 'node:child_process';
const { chromium } = await import('playwright').catch(() => import('/opt/npm-tools/node_modules/playwright/index.mjs'));
const root = path.dirname(new URL(import.meta.url).pathname);
const [specPath, out, a, b] = process.argv.slice(2);
const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
const types = { '.js': 'text/javascript', '.html': 'text/html', '.json': 'application/json', '.ttf': 'font/ttf', '.woff2': 'font/woff2', '.mp4': 'video/mp4' };
const srv = http.createServer((req, res) => {
  const p = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(root) || !fs.existsSync(p)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': types[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(res);
}).listen(0);
const port = srv.address().port;
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--disable-gpu-sandbox'] });
const page = await browser.newPage({ viewport: { width: spec.w, height: spec.h } });
page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.error('[page]', m.text()); });
page.on('pageerror', e => console.error('[pageerror]', e.message));
const rel = path.relative(root, path.resolve(specPath));
await page.goto(`http://127.0.0.1:${port}/index.html?spec=/${rel}`);
await page.waitForFunction('window.ready === true', null, { timeout: 180000 });
fs.writeFileSync(out.replace(/\.mp4$/, '') + '.events.json', JSON.stringify(await page.evaluate(() => window.getEvents ? window.getEvents() : [])));
if (a === '--frames') { // QC mode: node render.mjs spec.json outprefix.mp4 --frames 1.5,20,33.2
  for (const sec of b.split(',').map(Number)) { const url = await page.evaluate(f => window.renderFrame(f), Math.round(sec * spec.fps));
    fs.writeFileSync(`${out.replace(/\.mp4$/, '')}_${sec.toFixed(2)}.jpg`, Buffer.from(url.slice(url.indexOf(',') + 1), 'base64')); }
  await browser.close(); srv.close(); process.exit(0); }
const n0 = +(a ?? 0), n1 = +(b ?? Math.round(spec.duration * spec.fps));
const tmp = out.replace(/\.mp4$/, '.part.mp4');
const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(spec.fps), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23', '-pix_fmt', 'yuv420p', '-r', String(spec.fps), tmp], { stdio: ['pipe', 'inherit', 'inherit'] });
const T = Date.now();
for (let f = n0; f < n1; f++) {
  const url = await page.evaluate(f => window.renderFrame(f), f);
  const buf = Buffer.from(url.slice(url.indexOf(',') + 1), 'base64');
  if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  if ((f - n0) % 60 === 0) console.log(`frame ${f}/${n1}  ${((Date.now() - T) / (f - n0 + 1)).toFixed(0)} ms/frame`);
}
ff.stdin.end(); await new Promise(r => ff.on('close', c => { if (c === 0) fs.renameSync(tmp, out); console.log('ffmpeg exit', c); r(); }));
console.log(`done ${n1 - n0} frames in ${((Date.now() - T) / 1000).toFixed(1)}s`);
await browser.close(); srv.close();
