'use strict';
/**
 * Vendor Inter and IBM Plex Sans Arabic into public/fonts/ so the demo needs
 * no network at all.  Run once, on a machine with internet:
 *   npm run fonts
 */
const fs = require('fs');
const path = require('path');

const CSS_URL =
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700' +
  '&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap';

// Ask as a modern browser so Google serves woff2 rather than legacy formats.
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
          '(KHTML, like Gecko) Chrome/124.0 Safari/537.36';

const dir = path.join(__dirname, 'public', 'fonts');

(async () => {
  fs.mkdirSync(dir, { recursive: true });
  process.stdout.write('  fetching the stylesheet… ');
  const css = await fetch(CSS_URL, { headers: { 'User-Agent': UA } }).then((r) => {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.text();
  });
  console.log('ok');

  const urls = [...new Set([...css.matchAll(/url\((https:[^)]+\.woff2)\)/g)].map((m) => m[1]))];
  console.log(`  ${urls.length} font files to download`);

  let out = css;
  let n = 0;
  for (const u of urls) {
    const name = u.split('/').slice(-2).join('-').replace(/[^\w.-]/g, '_');
    const buf = Buffer.from(await fetch(u).then((r) => r.arrayBuffer()));
    fs.writeFileSync(path.join(dir, name), buf);
    out = out.split(u).join('/fonts/' + name);
    n++;
    process.stdout.write(`\r  downloaded ${n}/${urls.length}`);
  }
  console.log('');

  fs.writeFileSync(path.join(dir, 'fonts.css'), out, 'utf8');
  console.log(`\n  \x1b[32m✓\x1b[0m Fonts vendored into public/fonts/`);
  console.log('    The app now loads them locally — no network needed on demo night.\n');
})().catch((e) => {
  console.error('\n  \x1b[31m✗\x1b[0m Could not vendor the fonts: ' + e.message);
  console.error('    The app still works — it falls back to Google Fonts over the network.\n');
  process.exit(1);
});
