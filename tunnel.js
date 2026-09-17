'use strict';
/**
 * نفق HTTPS للهاتف · An HTTPS tunnel, so a phone can use the microphone.
 *
 * Browsers refuse the microphone and speech recognition on a plain http://
 * address, and http://192.168.x.x is plain. This opens a free Cloudflare quick
 * tunnel — no account, no signup — and prints the https:// URL to open on the
 * phone.
 *
 *   npm run tunnel        (leave `npm start` running in another window)
 */
require('dotenv').config();          // so PORT matches whatever the server uses
const { spawn } = require('child_process');
const os = require('os');
const PORT = process.env.PORT || 3000;

const bin = process.platform === 'win32' ? 'cloudflared.exe' : 'cloudflared';

/* النفق أنبوب فقط · a tunnel is only a pipe. If nothing is listening at this
   end, the link returns a Cloudflare error and looks like the tunnel's fault,
   so check first and say plainly what is missing. */
async function serverIsUp() {
  try {
    const c = new AbortController();
    const t = setTimeout(() => c.abort(), 2500);
    const r = await fetch(`http://localhost:${PORT}/api/health`, { signal: c.signal });
    clearTimeout(t);
    return r.ok;
  } catch (_) { return false; }
}

(async () => {
  if (!(await serverIsUp())) {
    console.error(`\n  \x1b[31m✗\x1b[0m Nothing is running on port ${PORT}.\n`);
    console.error('    A tunnel only forwards to the server — it cannot start it.');
    console.error('    Open another window, run \x1b[1mnpm start\x1b[0m, leave it open,');
    console.error('    then run \x1b[1mnpm run tunnel\x1b[0m again here.\n');
    process.exit(1);
  }
  console.log(`\n  Server found on port ${PORT}. Opening a tunnel…`);
  start();
})();

function start() {
const child = spawn(bin, ['tunnel', '--url', `http://localhost:${PORT}`], { stdio: ['ignore', 'pipe', 'pipe'] });

let printed = false;
const look = (buf) => {
  const m = String(buf).match(/https:\/\/[-a-z0-9]+\.trycloudflare\.com/);
  if (m && !printed) {
    printed = true;
    console.log('\n  \x1b[33mThe link changes every time you restart this.\x1b[0m Reopen it on the phone.');
    console.log(`\n  \x1b[32m✓\x1b[0m Open this on the phone, in \x1b[1mSafari\x1b[0m:\n`);
    console.log(`      \x1b[1m${m[0]}/app\x1b[0m       the pilgrim app`);
    console.log(`      ${m[0]}/web       the campaign board\n`);
    console.log('  Leave this window open for as long as the demo runs.\n');
  }
};
child.stdout.on('data', look);
child.stderr.on('data', look);

child.on('error', () => {
  console.error('\n  \x1b[31m✗\x1b[0m cloudflared is not installed.\n');
  console.error('    Windows:  winget install --id Cloudflare.cloudflared');
  console.error('    macOS:    brew install cloudflared');
  console.error('    Or download it from https://github.com/cloudflare/cloudflared/releases\n');
  console.error('    Fallback: ngrok http ' + PORT + '  (needs a free ngrok account)\n');
  process.exit(1);
});

// a friendly reminder of the LAN address too, for anything that does not need the mic
const nets = Object.values(os.networkInterfaces()).flat().filter((n) => n && n.family === 'IPv4' && !n.internal);
if (nets.length) console.log(`  (same wifi, no microphone: http://${nets[0].address}:${PORT}/web )`);
}
