'use strict';
/* المخرج المشترك · The shared director.
   Both film sets — the board and the phone — run this same script at the same
   timings, so two separate recordings line up when you put them side by side.
   A three-two-one countdown and a single white flash frame give you an exact
   sync point in both takes. */

window.SakeenahFilm = (function () {
  const PILGRIM = 'P-001';

  const post = (url, body) =>
    fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) })
      .then((r) => r.json()).catch(() => null);
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  /* الترتيب نفسه في كلا التسجيلين · the same order in both recordings */
  const BEATS = [
    // 1 · GUIDING.mp4 · 8s
    { ms: 8000,  cap: 'She guides him step by step',
      run: async () => {
        await post('/api/session/start', { pilgrimId: PILGRIM, lang: 'en' });
        await wait(400);
        await post('/api/demo/trigger', { pilgrimId: PILGRIM, kind: 'ritual', step: 2, brief: true });
      } },

    // 2 · LOST.mp4 · 10s
    { ms: 10000, cap: '62 metres from his group — she turns him back',
      run: () => post('/api/demo/trigger', { pilgrimId: PILGRIM, kind: 'drift', distance: 62, brief: true }) },

    // 3 · Medicine.mp4 · 10s
    { ms: 10000, cap: 'Metformin 500 mg — named aloud',
      run: async () => {
        await post('/api/demo/trigger', { pilgrimId: PILGRIM, kind: 'drift_resolved', brief: true });
        await wait(300);
        await post('/api/demo/trigger', { pilgrimId: PILGRIM, kind: 'medication', brief: true });
      } },

    // 4 · BREATHING.mp4 · 10s — she asks, then waits
    { ms: 6000,  cap: 'She has asked him — and stopped', view: 'alerts',
      run: () => post('/api/demo/trigger', { pilgrimId: PILGRIM, kind: 'fall', brief: true }) },
    { ms: 4000,  cap: 'Nothing has been sent. He decides.' },

    // 5 · waiting for help.mp4 · 10s — he confirms, the alert lands
    { ms: 8000,  cap: 'His consent, spoken aloud — the alert reaches the control room',
      run: async () => {
        await post('/api/chat', { pilgrimId: PILGRIM, text: 'Yes, please help me.', lang: 'en', brief: true });
        // حارس: البلاغ يجب أن يظهر في هذه اللقطة مهما حدث · the card has to land in
        // this shot. If the confirmation did not register — a stale session, a
        // reload mid-take — raise it directly, which runs the same code path.
        await wait(900);
        const live = await fetch('/api/alerts').then((r) => r.json()).catch(() => null);
        if (!live || !live.alerts || !live.alerts.length) {
          console.warn('[film] confirmation did not raise an alert — raising it directly');
          await post('/api/alerts/raise', { pilgrimId: PILGRIM });
        }
      } },
    { ms: 2000,  cap: 'Consent before alarm' }
  ];


  /** يعيد الخادم إلى نقطة الصفر · put the server back to a clean slate */
  async function reset() {
    // إنهاء أي جلسة سابقة ثم بدء نظيفة · end whatever was running, then start
    // fresh, so awaitingConfirm from an abandoned take cannot poison this one
    await post('/api/session/stop', { pilgrimId: PILGRIM });
    await post('/api/session/start', { pilgrimId: PILGRIM, lang: 'en' });
    await post('/api/session/stop', { pilgrimId: PILGRIM });
    const live = await fetch('/api/alerts').then((r) => r.json()).catch(() => null);
    for (const a of (live && live.alerts) || []) {
      await post(`/api/alerts/${encodeURIComponent(a.id)}/resolve`);
    }
    await post('/api/sim/location', { pilgrimId: PILGRIM, mode: 'with_group' }).catch(() => null);
  }

  /** العدّ التنازلي ثم ومضة بيضاء · countdown, then one white frame at t=0 */
  function countdown(host, onFlash) {
    return new Promise((resolve) => {
      const el = document.createElement('div');
      el.style.cssText =
        'position:fixed;inset:0;z-index:9999;background:#143527;color:#FDF8EF;display:flex;' +
        'align-items:center;justify-content:center;font-size:22vmin;font-weight:700;' +
        'font-family:Inter,sans-serif;font-variant-numeric:tabular-nums';
      host.appendChild(el);
      let n = 3;
      el.textContent = n;
      const tick = setInterval(() => {
        n--;
        if (n > 0) { el.textContent = n; return; }
        clearInterval(tick);
        el.style.background = '#FFFFFF';     // ← the sync frame
        el.textContent = '';
        if (onFlash) onFlash();
        setTimeout(() => { el.remove(); resolve(); }, 120);
      }, 1000);
    });
  }

  /**
   * @param {object} hooks { onBeat(beat, index), onEnd() }
   */
  async function roll(hooks = {}) {
    await reset();
    await wait(400);
    await countdown(document.body);
    for (let i = 0; i < BEATS.length; i++) {
      const b = BEATS[i];
      if (hooks.onBeat) hooks.onBeat(b, i);
      if (b.run) { try { await b.run(); } catch (_) {} }
      await wait(b.ms);
    }
    if (hooks.onEnd) hooks.onEnd();
    await post('/api/session/stop', { pilgrimId: PILGRIM });
  }

  const total = BEATS.reduce((a, b) => a + b.ms, 0);
  return { BEATS, roll, reset, total };
})();
