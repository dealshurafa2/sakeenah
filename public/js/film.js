'use strict';
/* موقع التصوير · The film set.
   One window, 1920x1080, containing the whole final frame: a panel for the
   generated footage of Hajj Mohammad, his real phone, and the real campaign
   board. A director runs the three scenes on a timer so a single screen
   recording gives every beat, in Sakeenah's real voice, at known timings. */

const $ = (id) => document.getElementById(id);
const PILGRIM = 'P-001';

const post = (url, body) =>
  fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) })
    .then((r) => r.json()).catch(() => null);

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/* نوجّه اللوحة · point the board at a view, without reloading it */
const boardView = (view) => {
  const f = $('board');
  if (f && f.contentWindow) f.contentWindow.postMessage({ sakeenah: 'view', view }, '*');
};

/* ------------------------------ the script ------------------------------ */
/* Each beat: what the strip says, what the man is doing, and what to fire.
   `hold` is how long the beat stays on screen before the next one. */
const SCENES = [
  {
    scene: 'Scene 1 · She guides him',        // GUIDING.mp4 · 8s
    dot: 0,
    beats: [
      { hold: 8000, line: 'Hajj Mohammad, 67, first Hajj. She tells him where he is, and what comes next.',
        cueLabel: 'Clip', cue: 'GUIDING.mp4 — 8 seconds',
        cap: 'She guides him step by step',
        run: async () => {
          await post('/api/session/start', { pilgrimId: PILGRIM, lang: 'en' });
          await wait(400);
          await post('/api/demo/trigger', { pilgrimId: PILGRIM, kind: 'ritual', step: 2, brief: true });
        } }
    ]
  },
  {
    scene: 'Scene 2 · His medicine',           // Medicine.mp4 · 10s
    dot: 1,
    beats: [
      { hold: 10000, line: 'His Metformin is due. She names the medicine and the dose aloud.',
        cueLabel: 'Clip', cue: 'Medicine.mp4 — 10 seconds',
        cap: 'Named aloud — not a notification he has to read',
        run: async () => { await post('/api/demo/trigger', { pilgrimId: PILGRIM, kind: 'medication', brief: true }); } }
    ]
  },
  {
    scene: 'Scene 3 · His group',              // LOST.mp4 · 10s
    dot: 2,
    beats: [
      { hold: 10000, line: 'The crowd carries him 62 metres away. She never calls him lost — she turns him back.',
        cueLabel: 'Clip', cue: 'LOST.mp4 — 10 seconds',
        cap: 'Distance checked continuously',
        run: async () => { await post('/api/demo/trigger', { pilgrimId: PILGRIM, kind: 'drift', distance: 62, brief: true }); } }
    ]
  },
  {
    scene: 'Scene 4 · The moment that matters', // BREATHING.mp4 · 10s
    dot: 3,
    beats: [
      { hold: 6000, line: 'His breathing changes. She hears it, and asks.',
        cueLabel: 'Clip', cue: 'BREATHING.mp4 — 10 seconds',
        cap: 'She has asked him — and stopped',
        run: async () => {
          boardView('alerts');
          await post('/api/demo/trigger', { pilgrimId: PILGRIM, kind: 'fall', brief: true });
        } },
      { hold: 4000, line: 'And she waits. Nothing has been sent. The board is still empty.',
        cueLabel: 'Clip', cue: 'BREATHING.mp4 — hold on his face',
        cap: 'Nothing has been sent. He decides.' },
      // waiting_for_help.mp4 · 10s
      { hold: 8000, line: 'He answers. Only now does the campaign know.',
        cueLabel: 'Clip', cue: 'waiting for help.mp4 — 10 seconds',
        cap: 'His consent, spoken aloud',
        run: async () => { await post('/api/chat', { pilgrimId: PILGRIM, text: 'Yes, please help me.', lang: 'en', brief: true }); } },
      { hold: 2000, line: 'She never raises an alert until she has asked, and he has said yes.',
        cueLabel: 'Closing', cue: 'Hold, then fade.',
        cap: 'Consent before alarm' }
    ]
  }
];

/* ------------------------------ the director ---------------------------- */
let t0 = 0;
function tick() {
  const s = Math.floor((Date.now() - t0) / 1000);
  $('clock').textContent = String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
}

function setDots(i) {
  [...$('dots').children].forEach((d, n) => d.classList.toggle('on', n <= i));
}

async function beat(b, sceneName) {
  $('scene').textContent = sceneName;
  $('line').textContent = b.line;
  $('cue-label').textContent = b.cueLabel;
  $('cue').textContent = b.cue;
  if (b.cap) $('phonecap').textContent = b.cap;
  if (b.run) { try { await b.run(); } catch (_) {} }
  await wait(b.hold);
}

async function roll() {
  $('curtain').remove();
  t0 = Date.now();
  setInterval(tick, 250);

  // a clean slate: no session, no leftover alert
  await post('/api/session/stop', { pilgrimId: PILGRIM });
  const live = await fetch('/api/alerts').then((r) => r.json()).catch(() => null);
  for (const a of (live && live.alerts) || []) await post(`/api/alerts/${encodeURIComponent(a.id)}/resolve`);
  await wait(600);

  boardView('roster');
  for (const sc of SCENES) {
    setDots(sc.dot);
    for (const b of sc.beats) await beat(b, sc.scene);
  }

  $('scene').textContent = 'Sakeenah · سكينة';
  $('line').textContent = 'An AI voice companion for vulnerable Hajj pilgrims.';
  $('cue-label').textContent = 'Done';
  $('cue').textContent = 'Stop the recording.';
  await post('/api/session/stop', { pilgrimId: PILGRIM });
}

$('go').addEventListener('click', roll);

/* اضبط المسرح على أي شاشة · fit the 1920x1080 stage to whatever screen this is,
   so the recording is always the same frame however large the monitor. */
function fit() {
  const s = Math.min(innerWidth / 1920, innerHeight / 1080);
  const st = $('stage');
  st.style.transform = `scale(${s})`;
  document.body.style.setProperty('--s', s);
  st.style.left = `${(innerWidth - 1920 * s) / 2}px`;
  st.style.top = `${(innerHeight - 1080 * s) / 2}px`;
  st.style.position = 'absolute';
}
addEventListener('resize', fit);
fit();
