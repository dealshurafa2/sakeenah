'use strict';
/**
 * أصوات الفيديو · Sakeenah's voice for the demo video.
 *
 * One mp3 per clip, named after the clip it belongs under, in the order they
 * appear. Drop them onto the timeline at the start times printed below.
 *
 *   npm run vo          English
 *   npm run vo -- ar    Arabic
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const tts = require('./lib/tts');
const instant = require('./lib/instant');
const DB = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'pilgrims.json'), 'utf8'));
const pilgrim = DB.pilgrims.find((p) => p.isDemoPilgrim);

const lang = process.argv[2] === 'ar' ? 'ar' : 'en';
const dir = path.join(__dirname, 'video-vo');
const B = { brief: true };

const LINES = [
  ['1-GUIDING',    '00:00', 'GUIDING.mp4',          instant.proactive('ritual', pilgrim, lang, B).reply],
  ['2-LOST',       '00:08', 'LOST.mp4',             instant.proactive('drift', pilgrim, lang, { distance: 62, brief: true }).reply],
  ['3-MEDICINE',   '00:18', 'Medicine.mp4',         instant.proactive('medication', pilgrim, lang, B).reply],
  ['4-ASKING',     '00:28', 'BREATHING.mp4',        instant.proactive('fall', pilgrim, lang, B).reply],
  ['5-CONFIRMING', '00:38', 'waiting for help.mp4', instant.confirmation(lang === 'en' ? 'yes' : 'نعم', lang, true).reply]
];

(async () => {
  fs.mkdirSync(dir, { recursive: true });
  console.log(`\n  Sakeenah · voice for the demo video (${lang.toUpperCase()})`);
  console.log('  ──────────────────────────────────────────────');
  for (const [name, at, clip, text] of LINES) {
    try {
      const buf = await tts.synthesize(text, { lang });
      const file = `${name}-${lang}.mp3`;
      fs.writeFileSync(path.join(dir, file), buf);
      console.log(`  \x1b[32m✓\x1b[0m ${at}  ${file}   (under ${clip})`);
      console.log(`         "${text}"`);
    } catch (e) {
      console.log(`  \x1b[31m✗\x1b[0m ${name}: ${e.message}`);
    }
  }
  console.log(`\n  Files are in ./video-vo/`);
  console.log('  Drop each one at the time shown. Your own two lines go at 00:29 and 00:39.\n');
})();
