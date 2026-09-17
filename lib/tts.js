'use strict';
/**
 * Sakeenah's voice — edge-tts (Microsoft Edge neural voices).
 * Free, no signup, no API key, no card.
 *
 * English: en-US-AvaMultilingualNeural   Arabic: ar-SA-ZariyahNeural
 * Both configurable in .env. "npm run voices" generates samples to compare.
 */

const crypto = require('crypto');
const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');

const VOICE_EN = process.env.SAKEENAH_VOICE_EN || 'en-US-AvaMultilingualNeural';
const VOICE_AR = process.env.SAKEENAH_VOICE_AR || process.env.SAKEENAH_VOICE || 'ar-SA-ZariyahNeural';
const FORMAT = OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3;

const voiceFor = (lang) => (lang === 'en' ? VOICE_EN : VOICE_AR);
const describe = (lang) => voiceFor(lang);

/* نفس الجملة لا تُولَّد مرتين · the same sentence is never generated twice */
const cache = new Map();
const MAX_CACHE = 200;
const key = (text, voice, extra) =>
  crypto.createHash('sha1').update(voice + '::' + extra + '::' + text).digest('hex');

/* اتصال دافئ لكل صوت — يوفّر مصافحة كاملة في كل رد
   A warm connection per voice — saves a full handshake on every reply. */
const warm = new Map();

async function instance(voice) {
  if (warm.has(voice)) return warm.get(voice);
  const tts = new MsEdgeTTS();
  await tts.setMetadata(voice, FORMAT);
  warm.set(voice, tts);
  return tts;
}

function once(inst, text, prosody) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const chunks = [];
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(new Error('TTS: timed out after 16s — check the internet connection'));
    }, 16000);

    let stream;
    try {
      stream = inst.toStream(text, prosody).audioStream;
    } catch (e) {
      clearTimeout(timer);
      return reject(e);
    }

    stream.on('data', (c) => chunks.push(c));
    stream.on('error', (e) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(e);
    });
    stream.on('end', () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      const b = Buffer.concat(chunks);
      if (!b.length) return reject(new Error('TTS: no audio returned by the service'));
      resolve(b);
    });
  });
}

/**
 * @param {string} text
 * @param {object} [opts] { lang, voice, rate, pitch }
 * @returns {Promise<Buffer>} MP3
 */
async function synthesize(text, opts = {}) {
  const clean = String(text || '').trim();
  if (!clean) throw new Error('TTS: empty text');

  const lang = opts.lang === 'en' ? 'en' : opts.lang === 'ar' ? 'ar' : null;
  const voice = opts.voice || (lang ? voiceFor(lang) : VOICE_AR);

  // نبرة هادئة وأبطأ قليلاً — المستمع مسن
  // A calm, slightly slower delivery — the listener is elderly.
  const prosody = {
    rate: opts.rate || (String(voice).startsWith('en-') ? '-6%' : '-8%'),
    pitch: opts.pitch || '+0Hz',
    volume: 'default'
  };

  const k = key(clean, voice, prosody.rate);
  if (cache.has(k)) return cache.get(k);

  let buf;
  try {
    buf = await once(await instance(voice), clean, prosody);
  } catch (e) {
    // a warm socket can go stale — rebuild once and retry
    warm.delete(voice);
    buf = await once(await instance(voice), clean, prosody);
  }

  if (cache.size >= MAX_CACHE) cache.delete(cache.keys().next().value);
  cache.set(k, buf);
  return buf;
}

module.exports = { synthesize, voiceFor, describe, VOICE_EN, VOICE_AR };
