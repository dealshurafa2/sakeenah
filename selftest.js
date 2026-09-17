'use strict';
/**
 * Pre-demo check: does the voice work, does Gemini work, and does the
 * distress rule ask for confirmation before raising anything?
 *   npm run selftest
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const tts = require('./lib/tts');
const gemini = require('./lib/gemini');
const DB = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'pilgrims.json'), 'utf8'));

const ok = (m) => console.log('  \x1b[32m✓\x1b[0m ' + m);
const bad = (m) => console.log('  \x1b[31m✗\x1b[0m ' + m);
const pilgrim = DB.pilgrims.find((x) => x.isDemoPilgrim);

async function checkVoice(lang, text) {
  const t0 = Date.now();
  const buf = await tts.synthesize(text, { lang });
  const out = path.join(__dirname, `selftest-voice-${lang}.mp3`);
  fs.writeFileSync(out, buf);
  ok(`${lang.toUpperCase()} voice (${tts.describe(lang)}) — ${(buf.length / 1024).toFixed(0)} KB in ${Date.now() - t0}ms`);
  console.log(`    Listen: ${out}`);
}

async function checkBrain(lang, utterance) {
  const t0 = Date.now();
  const r = await gemini.ask({
    pilgrim,
    campaign: DB.campaign,
    lang,
    now: '14:20',
    step: 2,
    drift: { active: false, distance: 5 },
    awaitingConfirm: false,
    history: [],
    userText: utterance
  });
  ok(`${lang.toUpperCase()} brain (${r.model || 'auto'}) — ${Date.now() - t0}ms`);
  console.log(`    Said:   ${r.reply}`);
  console.log(`    Action: ${r.action}`);
  if (r.action === 'ask_confirm_distress') {
    ok(`${lang.toUpperCase()} distress rule: asked for confirmation before any alert ✔`);
    return true;
  }
  bad(`${lang.toUpperCase()}: expected ask_confirm_distress, got ${r.action}`);
  return false;
}

(async () => {
  console.log('\n  Sakeenah · pre-demo check\n  ─────────────────────────────');
  let pass = true;
  let quotaScope = null;
  let sawQuota = false;

  // تسخين الاتصال · open both voice connections first, so the numbers below are
  // the real per-line cost and not a one-off handshake.
  process.stdout.write('  warming the voice connections… ');
  const warm = await Promise.all([
    tts.synthesize('مرحبا', { lang: 'en' }).then(() => null).catch((e) => 'EN ' + e.message),
    tts.synthesize('مرحبا', { lang: 'ar' }).then(() => null).catch((e) => 'AR ' + e.message)
  ]);
  const warmErrs = warm.filter(Boolean);
  console.log(warmErrs.length ? '\x1b[33msome failed\x1b[0m' : 'done');
  for (const w of warmErrs) console.log('    ' + w);

  // 1) Voices
  try {
    await checkVoice('en', "Take it easy, Hajj Mohammad. I'm right here with you. Do you need help?");
  } catch (e) { pass = false; bad('English voice failed: ' + e.message); }

  try {
    await checkVoice('ar', 'السلام عليكم يا حاج محمد، أنا سكينة، رفيقتك في رحلة الحج.');
  } catch (e) { pass = false; bad('Arabic voice failed: ' + e.message); }

  // 2) Brain
  if (!process.env.GEMINI_API_KEY) {
    pass = false;
    bad('GEMINI_API_KEY is missing — put it in your .env file');
  } else {
    try {
      const chain = await gemini.modelChain(process.env.GEMINI_API_KEY);
      ok(`Model: ${chain[0]}${chain[1] ? ` (fallback: ${chain[1]})` : ''}`);
    } catch (e) { bad('Could not list models: ' + e.message); }
    try {
      if (!(await checkBrain('en', "I'm so tired... I can't breathe properly"))) pass = false;
    } catch (e) {
      pass = false; bad('English brain failed: ' + e.message);
      if (e.code === 'QUOTA') { sawQuota = true; quotaScope = quotaScope || e.quotaScope; }
    }

    try {
      if (!(await checkBrain('ar', 'أنا تعبان... ما أقدر أتنفس زين'))) pass = false;
    } catch (e) {
      pass = false; bad('Arabic brain failed: ' + e.message);
      if (e.code === 'QUOTA') { sawQuota = true; quotaScope = quotaScope || e.quotaScope; }
    }
  }

  console.log('  ─────────────────────────────');
  if (pass) {
    console.log('  \x1b[32mReady for the demo ✓\x1b[0m\n');
  } else if (quotaScope === 'per-minute') {
    console.log('  \x1b[33mA per-minute limit, not a daily one.\x1b[0m');
    console.log('  Wait sixty seconds and run this again — it recovers on its own.\n');
  } else if (quotaScope === 'per-day') {
    console.log('  \x1b[31mA daily limit. It will not reset before tomorrow morning.\x1b[0m');
    console.log('  Get a fresh key from a different Google account and put it in .env.\n');
  } else if (sawQuota) {
    console.log('  \x1b[33mQuota was refused but Google did not say which limit.\x1b[0m');
    console.log('  Wait a minute and try once more. If it fails again, treat it as a daily limit');
    console.log('  and use a key from a different Google account.\n');
  } else {
    console.log('  \x1b[31mSomething is wrong — see above\x1b[0m\n');
  }
  if (!pass) {
    console.log('  Either way, the demo still runs: the triggers, the three questions and the');
    console.log('  confirmation make no Gemini call at all. Only free conversation is affected.\n');
  }
  process.exit(pass ? 0 : 1);
})();
