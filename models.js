'use strict';
/**
 * Lists every Gemini model your key can actually use, best first.
 *   npm run models
 *
 * Sakeenah picks the top one automatically, so you normally don't need to do
 * anything with this. It's here for when you want to see what you've got, or
 * pin a specific model by putting it in .env as GEMINI_MODEL=...
 */
require('dotenv').config();
const { listModels } = require('./lib/gemini');

(async () => {
  console.log('\n  Gemini models available to your key');
  console.log('  ─────────────────────────────────────');
  try {
    const models = await listModels();
    models.forEach((m, i) => {
      const mark = i === 0 ? '\x1b[32m→\x1b[0m' : ' ';
      const note = i === 0 ? '  \x1b[32m(Sakeenah will use this)\x1b[0m' : i === 1 ? '  (fallback)' : '';
      console.log(`  ${mark} ${m}${note}`);
    });
    console.log('  ─────────────────────────────────────');
    console.log('  To pin one manually, add it to .env:');
    console.log(`    GEMINI_MODEL=${models[0]}\n`);
  } catch (e) {
    console.log(`  \x1b[31m✗\x1b[0m ${e.message}\n`);
    process.exit(1);
  }
})();
