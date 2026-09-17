/* سكينة — الشاشة الثانية: وكيل الصوت · Sakeenah screen 2: the voice companion
   Speech in : Web Speech API (built into Chrome)
   Speech out: edge-tts from the server (natural neural voices)
   Brain     : Gemini via the server — the key never reaches the browser
*/
(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const T = (k) => window.I18N.t(k);
  const micBtn = $('mic');
  const micLabel = $('mic-label');
  const statusEl = $('status');
  const transcriptEl = $('transcript');
  const player = $('player');

  const socket = io();
  let pilgrim = null;
  let sessionOn = false;
  let mode = 'idle'; // idle | listening | thinking | speaking
  let recog = null;
  let recogRunning = false;
  let wantListen = false;
  let interimBubble = null;
  const speakQueue = [];
  let speaking = false;
  let lastSpokenText = null;

  const lang = () => window.I18N.lang;
  const srLang = () => (lang() === 'en' ? 'en-US' : 'ar-SA');

  /* ----------------------------- واجهة · UI ----------------------------- */
  function setMode(m, statusKey) {
    mode = m;
    micBtn.classList.remove('listening', 'thinking', 'speaking');
    if (m === 'listening') { micBtn.classList.add('listening'); micLabel.textContent = T('mic.listening'); }
    else if (m === 'thinking') { micBtn.classList.add('thinking'); micLabel.textContent = T('mic.thinking'); }
    else if (m === 'speaking') { micBtn.classList.add('speaking'); micLabel.textContent = T('mic.speaking'); }
    else { micLabel.textContent = sessionOn ? T('mic.stop') : T('mic.start'); }
    if (statusKey) statusEl.textContent = T(statusKey);
  }

  function bubble(kind, text, whoKey) {
    const d = document.createElement('div');
    d.className = 'bubble ' + kind;
    if (whoKey) {
      const s = document.createElement('span');
      s.className = 'who';
      s.textContent = T(whoKey);
      d.appendChild(s);
    }
    const body = document.createElement('span');
    body.className = 'bubble-text';
    body.textContent = text;
    d.appendChild(body);
    if (kind.indexOf('sakeenah') === 0) {
      const rp = document.createElement('button');
      rp.className = 'replay';
      rp.type = 'button';
      rp.title = T('audio.replay');
      rp.textContent = '🔊';
      rp.addEventListener('click', () => enqueueSpeak({ text }));
      d.appendChild(rp);
    }
    transcriptEl.appendChild(d);
    transcriptEl.scrollTop = transcriptEl.scrollHeight;
    return d;
  }

  function banner(id, html) {
    const el = $(id);
    if (!html) { el.classList.remove('show'); el.innerHTML = ''; return; }
    el.innerHTML = html;
    el.classList.add('show');
  }

  /* ------------------------------ الصوت · audio out ------------------- */
  const SILENT_WAV = 'data:audio/wav;base64,UklGRkQDAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YSADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==';

  function playBlob(blob) {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(blob);
      let done = false;
      const finish = (err) => {
        if (done) return;
        done = true;
        URL.revokeObjectURL(url);
        resolve(err || null);
      };
      player.src = url;
      player.muted = false;
      player.volume = 1;
      player.onended = () => finish(null);
      player.onerror = () => finish(new Error('audio decode failed'));
      player.play().catch((e) => finish(e));
    });
  }

  function audioProblem(err) {
    const blocked = err && (err.name === 'NotAllowedError' || /gesture|interact/i.test(err.message || ''));
    banner(
      'banner-info',
      (blocked ? T('audio.blocked') : T('audio.failed') + ' ' + (err && err.message ? err.message : '?') + ' ' + T('audio.checkMute')) +
        ' <button class="btn gold" id="btn-force-audio" style="margin-inline-start:8px">' + T('audio.play') + '</button>'
    );
    const b = $('btn-force-audio');
    if (b) b.addEventListener('click', () => {
      banner('banner-info', '');
      if (lastSpokenText) enqueueSpeak({ text: lastSpokenText });
    });
  }

  async function ttsFetch(text) {
    const r = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, lang: lang() })
    });
    if (!r.ok) throw new Error('TTS failed');
    return r.blob();
  }

  function enqueueSpeak(job) {
    speakQueue.push(job);
    drainQueue();
  }

  async function drainQueue() {
    if (speaking || !speakQueue.length) return;
    speaking = true;
    stopListening();
    while (speakQueue.length) {
      const job = speakQueue.shift();
      setMode('speaking');
      if (job.text) lastSpokenText = job.text;
      try {
        const blob = job.blob || (await ttsFetch(job.text));
        const err = await playBlob(blob);
        if (err) audioProblem(err);
        else banner('banner-info', '');
      } catch (e) {
        audioProblem(e);
      }
    }
    speaking = false;
    if (sessionOn && wantListen) startListening();
    else setMode('idle');
  }

  function b64ToBlob(b64, type) {
    const bin = atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return new Blob([arr], { type });
  }

  /* ------------------- الميكروفون: الفتح والمؤشر واختيار الجهاز -------- */
  let micStream = null;
  let micReady = false;
  let micCtx = null;
  let chosenDeviceId = null;

  async function listMics() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const mics = devices.filter((d) => d.kind === 'audioinput' && d.deviceId);
      const sel = $('mic-select');
      if (mics.length > 1) {
        sel.hidden = false;
        sel.innerHTML = mics
          .map((d, i) => `<option value="${d.deviceId}">${d.label || 'Microphone ' + (i + 1)}</option>`)
          .join('');
        if (chosenDeviceId) sel.value = chosenDeviceId;
        sel.onchange = async () => {
          chosenDeviceId = sel.value;
          micReady = false;
          if (micStream) micStream.getTracks().forEach((t) => t.stop());
          await initMic();
        };
      }
    } catch (_) {}
  }

  async function initMic() {
    if (micReady) return true;
    const bar = $('mic-level-bar');
    const label = $('mic-device');
    try {
      const constraints = {
        audio: chosenDeviceId
          ? { deviceId: { exact: chosenDeviceId }, echoCancellation: true, noiseSuppression: true, autoGainControl: true }
          : { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
      };
      micStream = await navigator.mediaDevices.getUserMedia(constraints);
      const track = micStream.getAudioTracks()[0];
      label.textContent = T('mic.pick') + ' ' + (track.label || '—');
      await listMics();

      if (!micCtx) micCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (micCtx.state === 'suspended') await micCtx.resume();
      const analyser = micCtx.createAnalyser();
      analyser.fftSize = 1024;
      micCtx.createMediaStreamSource(micStream).connect(analyser);

      const data = new Uint8Array(analyser.fftSize);
      let quietSince = Date.now();
      (function loop() {
        analyser.getByteTimeDomainData(data);
        let peak = 0;
        for (let i = 0; i < data.length; i++) {
          const v = Math.abs(data[i] - 128);
          if (v > peak) peak = v;
        }
        const pct = Math.min(100, Math.round((peak / 45) * 100));
        bar.style.width = pct + '%';
        bar.classList.toggle('hot', pct > 10);
        if (pct > 10) quietSince = Date.now();
        else if (sessionOn && Date.now() - quietSince > 12000) {
          label.textContent = T('mic.silent');
          quietSince = Date.now();
        }
        requestAnimationFrame(loop);
      })();

      micReady = true;
      return true;
    } catch (e) {
      label.textContent = e.name === 'NotAllowedError' ? T('mic.blocked') : T('mic.failed') + ': ' + e.name;
      return false;
    }
  }

  /* -------------------------- التعرف على الصوت · ASR ------------------ */
  function buildRecognizer() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return null;
    const r = new SR();
    r.lang = srLang();
    r.continuous = false;
    r.interimResults = true;
    r.maxAlternatives = 1;

    r.onstart = () => { recogRunning = true; setMode('listening', 'status.speakNow'); };

    r.onresult = (ev) => {
      let interim = '';
      let final = '';
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const t = ev.results[i][0].transcript;
        if (ev.results[i].isFinal) final += t;
        else interim += t;
      }
      if (interim) {
        if (!interimBubble) interimBubble = bubble('pilgrim interim', interim, 'who.pilgrim');
        else interimBubble.querySelector('.bubble-text').textContent = interim;
        transcriptEl.scrollTop = transcriptEl.scrollHeight;
      }
      if (final.trim()) {
        if (interimBubble) { interimBubble.remove(); interimBubble = null; }
        handlePilgrimUtterance(final.trim());
      }
    };

    r.onerror = (e) => {
      recogRunning = false;
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        wantListen = false;
        setMode('idle', 'status.micBlocked');
      } else if (e.error === 'no-speech') {
        statusEl.textContent = T('status.noSpeech');
      } else if (e.error === 'audio-capture') {
        statusEl.textContent = T('mic.silent');
      } else if (e.error !== 'aborted') {
        statusEl.textContent = 'Speech recognition error: ' + e.error;
      }
    };

    r.onend = () => {
      recogRunning = false;
      if (interimBubble) { interimBubble.remove(); interimBubble = null; }
      if (sessionOn && wantListen && !speaking && mode !== 'thinking') {
        setTimeout(() => {
          if (sessionOn && wantListen && !speaking && mode !== 'thinking') startListening();
        }, 300);
      }
    };
    return r;
  }

  function startListening() {
    if (!recog || recogRunning || speaking) return;
    recog.lang = srLang();
    try { recog.start(); } catch (_) {}
  }

  function stopListening() {
    if (recog && recogRunning) { try { recog.abort(); } catch (_) {} }
    recogRunning = false;
  }

  /* ---------------------------- دورة المحادثة · turn ------------------ */
  async function handlePilgrimUtterance(text) {
    wantListen = true;
    stopListening();
    bubble('pilgrim', text, 'who.pilgrim');
    setMode('thinking');
    try {
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pilgrimId: pilgrim.id, text, lang: lang() })
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'server error');
      renderSakeenah(data);
      enqueueSpeak(
        data.audio
          ? { blob: b64ToBlob(data.audio, 'audio/mpeg'), text: data.reply }
          : { text: data.reply }
      );
    } catch (e) {
      statusEl.textContent = 'Sakeenah is unreachable: ' + e.message;
      setMode('idle');
      if (sessionOn && wantListen) setTimeout(startListening, 700);
    }
  }

  function renderSakeenah(data) {
    bubble('sakeenah', data.reply, 'who.sakeenah');
    if (typeof data.step === 'number') $('st-step').textContent = `${data.step + 1} ${T('state.of')} 7`;

    if (data.action === 'ask_confirm_distress') {
      banner('banner-confirm',
        T('banner.confirm') +
        (data.distress_signals && data.distress_signals.length
          ? '<br><span style="font-size:12.5px;opacity:.85">' + T('banner.signals') + ' ' + data.distress_signals.join(' · ') + '</span>'
          : ''));
      $('st-distress').textContent = T('state.awaiting');
    } else if (data.action === 'confirmed_emergency') {
      banner('banner-confirm', '');
      banner('banner-emergency', T('banner.emergency'));
      $('st-distress').textContent = T('state.emergency');
    } else if (data.action === 'none' && $('st-distress').textContent === T('state.awaiting')) {
      banner('banner-confirm', '');
      $('st-distress').textContent = T('state.on');
    }
  }

  /* ------------------------------ الجلسة · session -------------------- */
  async function startSession() {
    // فك قيد التشغيل التلقائي داخل ضغطة المستخدم نفسها
    try {
      player.src = SILENT_WAV;
      player.muted = true;
      await player.play();
      player.pause();
      player.currentTime = 0;
    } catch (_) {}
    player.muted = false;
    player.volume = 1;

    await initMic();

    const r = await fetch('/api/session/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pilgrimId: pilgrim.id, lang: lang() })
    });
    const data = await r.json();

    sessionOn = true;
    wantListen = true;
    transcriptEl.innerHTML = '';
    banner('banner-emergency', ''); banner('banner-confirm', '');
    $('st-distress').textContent = T('state.on');
    $('st-step').textContent = `1 ${T('state.of')} 7`;
    setMode('listening', 'status.started');
    return data;
  }

  async function stopSession() {
    sessionOn = false;
    wantListen = false;
    stopListening();
    speakQueue.length = 0;
    await fetch('/api/session/stop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pilgrimId: pilgrim.id })
    }).catch(() => {});
    setMode('idle', 'status.ended');
  }

  micBtn.addEventListener('click', async () => {
    if (!pilgrim) return;
    if (!sessionOn) {
      if (!recog) {
        recog = buildRecognizer();
        if (!recog) statusEl.textContent = T('status.noSR');
      }
      await startSession();
      startListening();
    } else {
      await stopSession();
    }
  });

  $('text-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const v = $('text-input').value.trim();
    if (!v || !pilgrim) return;
    $('text-input').value = '';
    if (!sessionOn) await startSession();
    handlePilgrimUtterance(v);
  });

  document.querySelectorAll('[data-sim]').forEach((b) => {
    b.addEventListener('click', () => {
      fetch('/api/sim/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pilgrimId: pilgrim.id, mode: b.dataset.sim })
      });
    });
  });

  // مشغّلات العرض · demo triggers
  document.querySelectorAll('[data-demo]').forEach((b) => {
    b.addEventListener('click', async () => {
      if (!pilgrim) return;
      if (!sessionOn) await startSession();
      b.disabled = true;
      try {
        await fetch('/api/demo/trigger', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pilgrimId: pilgrim.id, kind: b.dataset.demo })
        });
      } finally {
        setTimeout(() => { b.disabled = false; }, 7000);
      }
    });
  });

  /* ---------------- تتبع الموقع: محاكاة أو GPS حقيقي · location source --------------- */
  let geoWatchId = null;
  let locationSource = 'sim';

  function postMode(source) {
    return fetch('/api/location/mode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pilgrimId: pilgrim.id,
        source,
        thresholdM: Number($('thr-input').value) || 40
      })
    });
  }

  function stopGeo() {
    if (geoWatchId != null) {
      navigator.geolocation.clearWatch(geoWatchId);
      geoWatchId = null;
    }
  }

  function startGeo() {
    if (!navigator.geolocation) {
      $('gps-status').textContent = T('gps.unsupported');
      return;
    }
    $('gps-status').textContent = T('gps.waiting');
    geoWatchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        $('gps-status').textContent =
          `${T('gps.fix')} ±${Math.round(accuracy)} m · ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
        fetch('/api/location', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pilgrimId: pilgrim.id, lat: latitude, lng: longitude, accuracy })
        }).catch(() => {});
      },
      (err) => {
        $('gps-status').textContent =
          err.code === err.PERMISSION_DENIED ? T('gps.denied') : 'GPS error: ' + err.message;
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 }
    );
  }

  document.querySelectorAll('[data-source]').forEach((b) => {
    b.addEventListener('click', async () => {
      locationSource = b.dataset.source;
      document.querySelectorAll('[data-source]').forEach((x) =>
        x.classList.toggle('active', x === b)
      );
      $('sim-controls').hidden = locationSource !== 'sim';
      $('gps-controls').hidden = locationSource !== 'real';
      await postMode(locationSource);
      if (locationSource === 'real') {
        banner('banner-info', T('gps.realNote'));
        startGeo();
      } else {
        stopGeo();
        banner('banner-info', '');
      }
    });
  });

  $('btn-anchor').addEventListener('click', async () => {
    await fetch('/api/location/anchor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pilgrimId: pilgrim.id })
    });
    $('gps-status').textContent = T('gps.anchored');
  });

  $('thr-input').addEventListener('change', () => {
    if (locationSource === 'real') postMode('real');
  });

  /* ------------------------------ Socket ------------------------------ */
  function renderConn() {
    $('conn-state').innerHTML = socket.connected
      ? T('agent.connected') + ' <span class="live-dot"></span>'
      : T('agent.disconnected');
  }
  socket.on('connect', renderConn);
  socket.on('disconnect', renderConn);

  socket.on('proactive-speak', (p) => {
    if (!pilgrim || p.pilgrimId !== pilgrim.id) return;
    const labelKey =
      p.kind === 'medication' ? 'sys.medication' :
      p.kind === 'drift' ? 'sys.drift' :
      p.kind === 'drift_resolved' ? 'sys.driftResolved' :
      p.kind === 'fall' ? 'sys.fall' :
      p.kind === 'greeting' ? null : 'sys.event';
    if (labelKey) bubble('system', T(labelKey), null);
    bubble('sakeenah', p.reply, 'who.sakeenah');
    lastSpokenText = p.reply;
    enqueueSpeak(p.audio ? { blob: b64ToBlob(p.audio, 'audio/mpeg'), text: p.reply } : { text: p.reply });
  });

  socket.on('proactive-error', (p) => {
    if (!pilgrim || p.pilgrimId !== pilgrim.id) return;
    statusEl.textContent = 'Background event failed: ' + p.error;
  });

  socket.on('brain', (p) => {
    if (!p.fallback) return banner('banner-info', '');
    banner('banner-info', p.quota ? T('banner.quota') : T('banner.fallback'));
  });

  socket.on('location', (p) => {
    if (!pilgrim || p.pilgrimId !== pilgrim.id) return;
    const tag = p.source === 'real' ? T('state.gpsReal') : T('state.gpsSim');
    $('st-distance').innerHTML =
      `${p.distance} m <span style="font-size:11px;font-weight:400;opacity:.7">· ${tag}</span>`;
    $('box-distance').classList.toggle('warn', Boolean(p.drifting));
  });

  /* ------------------------------ الإقلاع · boot ---------------------- */
  function renderPilgrimCard() {
    if (!pilgrim) return;
    const F = (o, f) => window.I18N.f(o, f);
    $('earpiece-tag').textContent = T('card.earpiece') + ' ' + pilgrim.earpieceId;
    $('pilgrim-card').innerHTML = `
      <div class="state-box"><span class="k">${T('card.name')}</span><span class="v">${F(pilgrim, 'name')}</span></div>
      <div class="state-box"><span class="k">${T('card.age')}</span><span class="v">${pilgrim.age} ${T('card.years')}</span></div>
      <div class="state-box"><span class="k">${T('card.condition')}</span><span class="v" style="font-size:12.5px">${F(pilgrim, 'condition')}</span></div>
      <div class="state-box"><span class="k">${T('card.contact')}</span><span class="v" style="font-size:12.5px">${F(pilgrim.emergencyContact, 'name')}</span></div>`;
    const meds = pilgrim.medications || [];
    $('st-med').textContent = meds.length
      ? `${F(meds[0], 'name')} · ${meds[0].times.join(' / ')}`
      : T('state.none');
    if (!sessionOn) {
      $('st-distress').textContent = T('state.on');
      micLabel.textContent = T('mic.start');
    }
  }

  document.addEventListener('langchange', () => {
    renderPilgrimCard();
    renderConn();
    if (recog) recog.lang = srLang();
    setMode(mode);
  });

  (async function boot() {
    const db = await fetch('/api/campaign').then((r) => r.json());
    pilgrim = db.pilgrims.find((p) => p.isDemoPilgrim) || db.pilgrims[0];
    renderPilgrimCard();

    micBtn.disabled = false;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) statusEl.textContent = T('status.noSR');

    const h = await fetch('/api/health').then((x) => x.json()).catch(() => null);
    if (h && !h.geminiKey) banner('banner-info', T('banner.noKey'));
  })();
})();
