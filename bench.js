'use strict';
/**
 * Times each model your key can use on a REAL Sakeenah turn, in both languages,
 * and tells you which one to pin for the demo.
 *   npm run bench
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const gemini = require('./lib/gemini');
const DB = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'pilgrims.json'), 'utf8'));
const pilgrim = DB.pilgrims.find((x) => x.isDemoPilgrim);

const CASES = [
  { lang: 'en', text: "I'm so tired... I can't breathe properly" },
  { lang: 'ar', text: 'أنا تعبان... ما أقدر أتنفس زين' }
];

async function timeOne(model, lang, text) {
  process.env.GEMINI_MODEL = model;
  delete require.cache[require.resolve('./lib/gemini')];
  const g = require('./lib/gemini');
  const t0 = Date.now();
  try {
    const r = await g.ask({
      pilgrim, campaign: DB.campaign, lang, now: '14:20', step: 2,
      drift: { active: false, distance: 5 }, awaitingConfirm: false, history: [], userText: text
    });
    return { ms: Date.now() - t0, ok: r.action === 'ask_confirm_distress', action: r.action };
  } catch (e) {
    return { ms: Date.now() - t0, ok: false, error: e.message.slice(0, 60) };
  }
}

(async () => {
  console.log('\n  Sakeenah · model speed test');
  console.log('  ─────────────────────────────────────');
  console.log('  Timing a real distress turn on each model. Takes a minute.\n');

  const all = await gemini.listModels();
  const candidates = all.filter((m) => /flash/.test(m) && !/image|tts|transcribe|preview/.test(m)).slice(0, 5);
  const results = [];

  for (const model of candidates) {
    const row = { model, en: null, ar: null };
    for (const c of CASES) {
      const r = await timeOne(model, c.lang, c.text);
      row[c.lang] = r;
    }
    results.push(row);
    const fmt = (r) => (r.ok ? `${(r.ms / 1000).toFixed(1)}s` : `\x1b[31mfailed\x1b[0m`);
    console.log(`  ${model.padEnd(26)} EN ${fmt(row.en).padEnd(16)} AR ${fmt(row.ar)}`);
    if (row.en.error) console.log(`     ${row.en.error}`);
  }

  const good = results.filter((r) => r.en.ok && r.ar.ok);
  good.sort((a, b) => a.en.ms + a.ar.ms - (b.en.ms + b.ar.ms));

  console.log('  ─────────────────────────────────────');
  if (!good.length) {
    console.log('  \x1b[31mNo model passed both languages.\x1b[0m Leave GEMINI_MODEL empty and let it auto-pick.\n');
    process.exit(1);
  }
  const best = good[0];
  const avg = ((best.en.ms + best.ar.ms) / 2000).toFixed(1);
  console.log(`  \x1b[32mFastest reliable model: ${best.model}\x1b[0m  (~${avg}s average)`);

  // نثبّته في .env مباشرة · pin it straight into .env, so nothing is left to hand-edit
  const envPath = path.join(__dirname, '.env');
  try {
    let env = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
    const line = `GEMINI_MODEL=${best.model}`;
    if (/^GEMINI_MODEL=.*$/m.test(env)) env = env.replace(/^GEMINI_MODEL=.*$/m, line);
    else env += (env.endsWith('\n') || !env ? '' : '\n') + line + '\n';
    fs.writeFileSync(envPath, env, 'utf8');
    console.log(`  \x1b[32m✓\x1b[0m Pinned in .env — restart the server to use it.\n`);
  } catch (e) {
    console.log('  Could not write .env — add this line yourself:');
    console.log(`    GEMINI_MODEL=${best.model}\n`);
  }
})();
