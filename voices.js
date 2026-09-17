'use strict';
/**
 * يقيس كل صوت ويحفظ عيّنة · Times every candidate voice and saves a sample,
 * so you can pick on both sound and speed.
 *
 *   npm run voices           English candidates
 *   npm run voices -- ar     Arabic candidates
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const tts = require('./lib/tts');

const lang = process.argv[2] === 'ar' ? 'ar' : 'en';
const dir = path.join(__dirname, 'voice-samples');

const CANDIDATES = {
  en: [
    'en-US-AvaMultilingualNeural',
    'en-US-EmmaMultilingualNeural',
    'en-US-JennyNeural',
    'en-US-AriaNeural',
    'en-GB-SoniaNeural',
    'en-US-MichelleNeural'
  ],
  ar: [
    'ar-SA-ZariyahNeural',
    'ar-EG-SalmaNeural',
    'ar-AE-FatimaNeural',
    'ar-JO-SanaNeural',
    'ar-KW-NouraNeural',
    'ar-SA-HamedNeural'
  ]
};

const LINE = {
  en: "Take it easy, Hajj Mohammad. Breathe slowly, I'm right here with you. Do you need help?",
  ar: 'على مهلك يا حاج محمد. تنفّس ببطء، أنا معك هنا. هل تحتاج مساعدة؟'
};

(async () => {
  fs.mkdirSync(dir, { recursive: true });
  console.log(`\n  Sakeenah · ${lang.toUpperCase()} voice test`);
  console.log('  ─────────────────────────────────────────────');
  console.log('  Each voice is timed twice: cold (first connection) then warm.\n');

  const rows = [];
  for (const voice of CANDIDATES[lang]) {
    let cold = null, warm = null, err = null;
    try {
      let t0 = Date.now();
      const buf = await tts.synthesize(LINE[lang], { lang, voice });
      cold = Date.now() - t0;
      fs.writeFileSync(path.join(dir, `${voice}.mp3`), buf);

      // a different sentence, same voice — this is the real per-line cost
      t0 = Date.now();
      await tts.synthesize(LINE[lang] + ' ', { lang, voice });
      warm = Date.now() - t0;
    } catch (e) {
      err = e.message.slice(0, 60);
    }
    rows.push({ voice, cold, warm, err });
    const f = (v) => (v == null ? '  —  ' : `${(v / 1000).toFixed(1)}s`.padStart(6));
    console.log(`  ${voice.padEnd(30)} cold ${f(cold)}   warm ${f(warm)}${err ? `   \x1b[31m${err}\x1b[0m` : ''}`);
  }

  const good = rows.filter((r) => r.warm != null).sort((a, b) => a.warm - b.warm);
  console.log('  ─────────────────────────────────────────────');
  if (!good.length) {
    console.log('  \x1b[31mNo voice responded. Check your internet connection.\x1b[0m\n');
    process.exit(1);
  }
  console.log(`  Samples saved in ./voice-samples/ — listen before you decide.`);
  console.log(`  \x1b[32mFastest: ${good[0].voice}\x1b[0m (${(good[0].warm / 1000).toFixed(1)}s warm)\n`);
  console.log('  If you like how it sounds, put this in .env and restart:');
  console.log(`    SAKEENAH_VOICE_${lang.toUpperCase()}=${good[0].voice}\n`);
})();
