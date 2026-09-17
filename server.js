'use strict';
require('dotenv').config();

const path = require('path');
const fs = require('fs');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const gemini = require('./lib/gemini');
const fallbackBrain = require('./lib/fallback-brain');
const instant = require('./lib/instant');
const tts = require('./lib/tts');
const S = require('./lib/session');

const PORT = Number(process.env.PORT || 3000);
const DATA_PATH = path.join(__dirname, 'data', 'pilgrims.json');
const DB = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(express.json({ limit: '256kb' }));
app.use(express.static(path.join(__dirname, 'public')));

const alerts = [];          // تنبيهات حيّة في هذه الجلسة
const eventLog = [];        // سجل الأحداث (دواء، ابتعاد، إلخ)

function findPilgrim(id) {
  return DB.pilgrims.find((p) => p.id === id);
}
const demoPilgrim = () => DB.pilgrims.find((p) => p.isDemoPilgrim) || DB.pilgrims[0];

function timeLabel() {
  return new Intl.DateTimeFormat('ar-SA-u-nu-latn', {
    timeZone: 'Asia/Riyadh',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(new Date());
}

/* ------------------------------ الصفحات ------------------------------ */
app.get('/', (_req, res) => res.redirect('/app'));
app.get('/app', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'app.html')));
app.get('/agent', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'agent.html')));
app.get('/web', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'web.html')));
app.get('/film', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'film.html')));
app.get('/film/web', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'film-web.html')));
app.get('/film/phone', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'film-phone.html')));
app.get('/roster', (_req, res) => res.redirect('/web'));
app.get('/alerts', (_req, res) => res.redirect('/web'));

/* ------------------------------- البيانات ---------------------------- */
// الخطوط: محليّة إن وُجدت، وإلا من Google · fonts: local when vendored, else Google
app.get('/css/fonts.css', (_req, res) => {
  const local = path.join(__dirname, 'public', 'fonts', 'fonts.css');
  if (fs.existsSync(local)) return res.type('css').sendFile(local);
  res.type('css').send(
    "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700" +
    "&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap');"
  );
});

app.get('/api/campaign', (_req, res) =>
  res.json({ campaign: DB.campaign, pilgrims: DB.pilgrims, resolvedIncidents: DB.resolvedIncidents })
);

app.get('/api/pilgrims/:id', (req, res) => {
  const p = findPilgrim(req.params.id);
  if (!p) return res.status(404).json({ error: 'غير موجود' });
  res.json(p);
});

app.get('/api/alerts', (_req, res) =>
  res.json({ alerts, events: eventLog.slice(-40), resolvedIncidents: DB.resolvedIncidents })
);

app.get('/api/health', async (_req, res) => {
  res.json({
    ok: true,
    geminiKey: Boolean(process.env.GEMINI_API_KEY),
    model: gemini.MODEL,
    voiceEn: tts.describe('en'),
    voiceAr: tts.describe('ar'),
    demoPilgrim: demoPilgrim().name,
    gemini: gemini.usage()
  });
});

/* -------------------------------- الصوت ------------------------------ */
app.post('/api/tts', async (req, res) => {
  try {
    const t0 = Date.now();
    const buf = await tts.synthesize(req.body.text, {
      lang: req.body.lang,
      voice: req.body.voice
    });
    console.log(`[TIMING] voice ${Date.now() - t0}ms (${tts.describe(req.body.lang === 'en' ? 'en' : 'ar')})`);
    res.set('Content-Type', 'audio/mpeg');
    res.set('Cache-Control', 'no-store');
    res.send(buf);
  } catch (e) {
    console.error('[TTS]', e.message);
    res.status(500).json({ error: e.message });
  }
});

/* ------------------------------ عقل سكينة ---------------------------- */
const FALLBACK = process.env.FALLBACK_BRAIN === '1';
let usingFallback = false;

async function think(ctx) {
  try {
    const out = await gemini.ask(ctx);
    if (usingFallback) { usingFallback = false; io.emit('brain', { fallback: false }); }
    return out;
  } catch (e) {
    const quota = e.code === 'QUOTA';
    if (!FALLBACK) {
      console.error(`[BRAIN] ${e.message}`);
      throw e;
    }
    console.warn(`[BRAIN] Gemini unavailable (${quota ? 'quota' : e.message}) — using local fallback`);
    if (!usingFallback) {
      usingFallback = true;
      io.emit('brain', { fallback: true, quota, error: e.message });
    }
    return fallbackBrain.ask(ctx);
  }
}

async function runTurn({ pilgrim, userText, event, kind, brief }) {
  const s = S.getSession(pilgrim);

  /* الردود الفورية · the scripted beats answer instantly, with no Gemini call:
     the four triggers, the three tap questions, and yes/no to "Do you need help?".
     Anything he says freely still goes to Gemini — that is the real conversation. */
  const quick = kind
    ? instant.proactive(kind, pilgrim, s.lang, {
        distance: s.drift.distance,
        direction: s.lang === 'en' ? s.drift.directionEn : s.drift.direction,
        step: s.step,
        brief
      })
    : instant.answer(userText, {
        pilgrim, lang: s.lang, step: s.step, drift: s.drift, awaitingConfirm: s.awaitingConfirm, brief
      });

  const out = quick
    ? { ...quick, step: s.step, distress_signals: [], reason: 'instant', model: 'instant' }
    : await think({
        pilgrim,
        campaign: DB.campaign,
        lang: s.lang,
        now: S.nowInMakkah(),
        step: s.step,
        drift: s.drift,
        awaitingConfirm: s.awaitingConfirm,
        history: s.history,
        userText,
        event
      });

  // تحديث الحالة
  s.step = out.step;
  if (userText) s.history.push({ role: 'pilgrim', text: userText });
  s.history.push({ role: 'sakeenah', text: out.reply });
  if (s.history.length > 24) s.history = s.history.slice(-24);

  if (out.action === 'ask_confirm_distress') {
    s.awaitingConfirm = true;
  } else if (out.action === 'confirmed_emergency') {
    s.awaitingConfirm = false;
  } else if (!event) {
    s.awaitingConfirm = false;
  }

  // بثّ دورة المحادثة لكل الشاشات
  io.emit('turn', {
    pilgrimId: pilgrim.id,
    pilgrimName: pilgrim.name,
    userText: userText || null,
    reply: out.reply,
    action: out.action,
    step: s.step,
    kind: kind || (event ? 'system' : 'speech'),
    distress_signals: out.distress_signals,
    at: timeLabel()
  });

  // أحداث غير طارئة تُسجَّل في الشاشة الثالثة كسطور معلوماتية
  if (out.action === 'medication_reminder' || kind === 'medication') {
    pushEvent({
      type: 'medication',
      pilgrim,
      title: 'تذكير دواء تلقائي',
      title_en: 'Automatic medication reminder',
      detail: out.reply
    });
  }
  if (out.action === 'lost_guidance' || kind === 'drift') {
    pushEvent({
      type: 'drift',
      pilgrim,
      title: `ابتعاد عن المجموعة · ${s.drift.distance} م`,
      title_en: `Drifted from group · ${s.drift.distance} m`,
      detail: out.reply
    });
  }
  if (kind === 'fall') {
    pushEvent({
      type: 'fall',
      pilgrim,
      title: 'سقوط مرصود من مستشعر السماعة',
      title_en: 'Fall detected by earpiece sensor',
      detail: out.reply
    });
  }
  if (kind === 'drift_resolved') {
    pushEvent({
      type: 'drift_resolved',
      pilgrim,
      title: 'عاد إلى مجموعته',
      title_en: 'Rejoined his group',
      detail: out.reply
    });
  }

  // الطوارئ المؤكدة
  if (out.action === 'confirmed_emergency' && !s.emergencyOpen) {
    s.emergencyOpen = true;
    raiseEmergency(pilgrim, out, s);
  }

  return { ...out, step: s.step, drift: s.drift, awaitingConfirm: s.awaitingConfirm };
}

function pushEvent(e) {
  const rec = {
    id: 'EV-' + (eventLog.length + 1).toString().padStart(4, '0'),
    type: e.type,
    pilgrimId: e.pilgrim.id,
    pilgrimName: e.pilgrim.name,
    pilgrimName_en: e.pilgrim.name_en,
    earpieceId: e.pilgrim.earpieceId,
    title: e.title,
    title_en: e.title_en || e.title,
    detail: e.detail,
    at: timeLabel()
  };
  eventLog.push(rec);
  io.emit('event', rec);
}

function raiseEmergency(pilgrim, out, s) {
  const alert = {
    id: 'ALR-' + (alerts.length + 1).toString().padStart(4, '0'),
    at: timeLabel(),
    pilgrim: {
      id: pilgrim.id,
      name: pilgrim.name,
      name_en: pilgrim.name_en,
      age: pilgrim.age,
      nationality: pilgrim.nationality,
      nationality_en: pilgrim.nationality_en,
      condition: pilgrim.condition,
      condition_en: pilgrim.condition_en,
      medications: pilgrim.medications,
      earpieceId: pilgrim.earpieceId,
      groupId: pilgrim.groupId,
      groupId_en: pilgrim.groupId_en,
      emergencyContact: pilgrim.emergencyContact
    },
    signals: out.distress_signals || [],
    reason: out.reason || '',
    spoken: out.reply,
    location: { ...s.location, distanceFromGroup: s.drift.distance },
    ritualStep: s.step,
    notifications: []
  };
  alerts.unshift(alert);
  io.emit('alert', alert);

  // محاكاة إشعار جهات الطوارئ — سطور سجل متتابعة تظهر حيّة في الشاشة الثالثة
  const steps = [
    {
      text: `تم إبلاغ جهة الطوارئ المسجلة: ${pilgrim.emergencyContact.name} — ${pilgrim.emergencyContact.phone} (رسالة نصية · محاكاة)`,
      text_en: `Registered emergency contact notified: ${pilgrim.emergencyContact.name_en} — ${pilgrim.emergencyContact.phone} (SMS · simulated)`
    },
    {
      text: `تم إبلاغ رئيس الحملة: ${DB.campaign.leader} — ${DB.campaign.leaderPhone} (محاكاة)`,
      text_en: `Campaign leader notified: ${DB.campaign.leader_en} — ${DB.campaign.leaderPhone} (simulated)`
    },
    {
      text: `أُرسل موقع الحاج التقريبي ومعرّف سماعته ${pilgrim.earpieceId} إلى أقرب مشرف ميداني`,
      text_en: `Approximate location and earpiece ID ${pilgrim.earpieceId} sent to the nearest field supervisor`
    },
    {
      text: `أُرفقت الحالة الصحية المسجلة: ${pilgrim.condition}`,
      text_en: `Registered medical conditions attached: ${pilgrim.condition_en}`
    }
  ];
  steps.forEach((st, i) => {
    setTimeout(() => {
      const line = { alertId: alert.id, text: st.text, text_en: st.text_en, at: timeLabel() };
      alert.notifications.push(line);
      io.emit('alert-log', line);
    }, 700 * (i + 1));
  });
}

/* ------------------------------ نقاط النهاية ------------------------- */
/* ----------------- دورة حياة البلاغ · the alert lifecycle ---------------- */
const SUPERVISOR = process.env.SAKEENAH_SUPERVISOR || 'Yasir Al-Harthi';

app.post('/api/alerts/:id/ack', (req, res) => {
  const a = alerts.find((x) => x.id === req.params.id);
  if (!a) return res.status(404).json({ error: 'no such alert' });
  a.acked = true;
  a.supervisor = SUPERVISOR;
  const line = {
    alertId: a.id,
    text: `المشرف ${SUPERVISOR} استلم البلاغ وهو في الطريق`,
    text_en: `Supervisor ${SUPERVISOR} acknowledged and is on his way`,
    at: timeLabel()
  };
  a.notifications.push(line);
  io.emit('alert-ack', { id: a.id, supervisor: SUPERVISOR });
  io.emit('alert-log', line);
  res.json({ ok: true, alert: a });
});

app.post('/api/alerts/:id/resolve', (req, res) => {
  const i = alerts.findIndex((x) => x.id === req.params.id);
  if (i < 0) return res.status(404).json({ error: 'no such alert' });
  const [a] = alerts.splice(i, 1);
  const closed = {
    id: a.id,
    pilgrimName: a.pilgrim.name,
    pilgrimName_en: a.pilgrim.name_en,
    earpieceId: a.pilgrim.earpieceId,
    type: 'ضيق مؤكَّد — سألته فقال نعم',
    type_en: 'Confirmed distress — she asked, he said yes',
    at: 'اليوم ' + a.at,
    at_en: 'Today ' + a.at,
    outcome: `وصل المشرف ${a.supervisor || SUPERVISOR}`,
    outcome_en: `Reached by ${a.supervisor || SUPERVISOR}`,
    minutes: req.body && req.body.minutes ? String(req.body.minutes) : null
  };
  DB.resolvedIncidents.unshift(closed);
  io.emit('alert-resolved', { id: a.id, closed });
  res.json({ ok: true, closed });
});

// بلاغ تجريبي معنون بوضوح · a clearly-labelled test alert, for the demo board
app.post('/api/alerts/raise', (req, res) => {
  const pilgrim = findPilgrim(req.body.pilgrimId) || demoPilgrim();
  if (alerts.some((a) => a.pilgrim.id === pilgrim.id)) {
    return res.json({ ok: true, already: true });
  }
  const s = S.getSession(pilgrim);
  raiseEmergency(
    pilgrim,
    {
      reply: 'I have told your son and your campaign leader. Stay where you are — someone is coming to you now.',
      distress_signals: ["I'm so tired… I can't breathe."],
      reason: 'Test alert raised from the campaign board'
    },
    s
  );
  res.json({ ok: true });
});

app.post('/api/session/start', async (req, res) => {
  const pilgrim = findPilgrim(req.body.pilgrimId) || demoPilgrim();
  S.resetSession(pilgrim.id);
  const lang = req.body.lang === 'ar' ? 'ar' : 'en';
  const s = S.setActive(pilgrim, true, lang);
  res.json({ ok: true, pilgrim, step: s.step, drift: s.drift, lang });

  // ترحيب ثابت — لا يستهلك طلب Gemini في كل بدء جلسة
  // Fixed greeting — costs no Gemini request on every session start.
  setTimeout(() => emitGreeting(pilgrim, lang), 250);
});

// تبديل اللغة بدون أي طلب إلى Gemini · switch language without spending a Gemini call
app.post('/api/session/lang', (req, res) => {
  const pilgrim = findPilgrim(req.body.pilgrimId) || demoPilgrim();
  const lang = req.body.lang === 'ar' ? 'ar' : 'en';
  const s = S.getSession(pilgrim);
  S.setActive(pilgrim, s.active, lang);
  res.json({ ok: true, lang });
});

app.post('/api/session/stop', (req, res) => {
  const pilgrim = findPilgrim(req.body.pilgrimId) || demoPilgrim();
  S.setActive(pilgrim, false);
  res.json({ ok: true });
});

app.post('/api/chat', async (req, res) => {
  const pilgrim = findPilgrim(req.body.pilgrimId) || demoPilgrim();
  const text = String(req.body.text || '').trim();
  if (req.body.lang) S.setActive(pilgrim, true, req.body.lang);
  if (!text) return res.status(400).json({ error: 'no text' });
  try {
    const t0 = Date.now();
    const out = await runTurn({ pilgrim, userText: text, brief: !!req.body.brief });
    const tBrain = Date.now() - t0;

    // نولّد الصوت هنا مباشرة بدل جولة ثانية من المتصفح
    // Generate the audio here instead of making the browser ask a second time.
    let audio = null;
    const t1 = Date.now();
    if (req.body.withAudio !== false) {
      const lang = S.getSession(pilgrim).lang;
      const buf = await tts.synthesize(out.reply, { lang }).catch((e) => {
        console.warn('[TTS]', e.message);
        return null;
      });
      if (buf) audio = buf.toString('base64');
    }
    console.log(`[TIMING] brain ${tBrain}ms + voice ${Date.now() - t1}ms = ${Date.now() - t0}ms`);
    res.json({ ...out, audio });
  } catch (e) {
    console.error('[CHAT]', e.message);
    res.status(500).json({ error: e.message, code: e.code || null });
  }
});

app.get('/api/state/:id', (req, res) => {
  const pilgrim = findPilgrim(req.params.id) || demoPilgrim();
  const s = S.getSession(pilgrim);
  res.json({
    step: s.step,
    drift: s.drift,
    awaitingConfirm: s.awaitingConfirm,
    location: s.location,
    group: s.group,
    simMode: s.simMode,
    locationSource: s.locationSource,
    accuracy: s.accuracy,
    thresholdM: s.thresholdM,
    active: s.active
  });
});

// وضع المحاكاة (عرض) · simulation controls
app.post('/api/sim/location', (req, res) => {
  const pilgrim = findPilgrim(req.body.pilgrimId) || demoPilgrim();
  const s = S.setSimMode(pilgrim, req.body.mode || 'with_group');
  res.json({ ok: true, simMode: s.simMode, drift: s.drift });
});

// اختيار مصدر الإحداثيات: محاكاة العرض أو GPS حقيقي من جهاز الحاج
app.post('/api/location/mode', (req, res) => {
  const pilgrim = findPilgrim(req.body.pilgrimId) || demoPilgrim();
  const s = S.setLocationMode(pilgrim, req.body.source, req.body.thresholdM);
  res.json({ ok: true, locationSource: s.locationSource, thresholdM: s.thresholdM, drift: s.drift });
});

// إحداثيات GPS حقيقية من متصفح الحاج
app.post('/api/location', (req, res) => {
  const pilgrim = findPilgrim(req.body.pilgrimId) || demoPilgrim();
  const lat = Number(req.body.lat);
  const lng = Number(req.body.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return res.status(400).json({ error: 'invalid coordinates' });
  }
  const s = S.setRealLocation(pilgrim, lat, lng, req.body.accuracy);
  res.json({
    ok: true,
    distance: s.drift.distance,
    drifting: s.drift.active,
    accuracy: s.accuracy,
    thresholdM: s.thresholdM
  });
});

/* ---------------- مشغّلات العرض · demo triggers for recording ----------------
   لا تغيّر شيئاً في المنطق الحقيقي: تُطلق نفس الأحداث التي يطلقها النظام تلقائياً،
   لكن الآن بدل انتظار الساعة ٢٠:٠٠ أو المشي ٨٠ متراً.
   These fire the SAME events the system raises on its own — nothing is faked,
   you just don't have to wait for 20:00 or walk 80 metres to record it. */
function nextDose(pilgrim, lang) {
  const meds = pilgrim.medications || [];
  if (!meds.length) return null;
  const now = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Riyadh', hour: '2-digit', minute: '2-digit', hour12: false
  }).format(new Date());
  let best = null;
  for (const med of meds) {
    for (const t of med.times) {
      if (!best || Math.abs(t.localeCompare(now)) < Math.abs(best.t.localeCompare(now))) {
        best = { med, t };
      }
    }
  }
  const m = best.med;
  const name = lang === 'en' ? (m.name_en || m.name) : m.name;
  const dose = lang === 'en' ? (m.dose_en || m.dose) : m.dose;
  const note = lang === 'en' ? (m.note_en || m.note) : m.note;
  return { name, dose, note, time: best.t };
}

app.post('/api/demo/trigger', (req, res) => {
  const pilgrim = findPilgrim(req.body.pilgrimId) || demoPilgrim();
  const s = S.getSession(pilgrim);
  const lang = s.lang === 'en' ? 'en' : 'ar';
  const kind = String(req.body.kind || '');
  let event = null;

  if (kind === 'ritual') {
    const step = req.body.step != null ? Number(req.body.step) : s.step;
    s.step = step;
    event = lang === 'en'
      ? `Guide the pilgrim through step ${step} of Tawaf in one or two short sentences.`
      : `أرشدي الحاج في الخطوة ${step} من الطواف بجملة أو جملتين قصيرتين.`;
  } else if (kind === 'medication') {
    const d = nextDose(pilgrim, lang);
    if (!d) return res.status(400).json({ error: 'no medications on file' });
    event = lang === 'en'
      ? `It is now time for the pilgrim's medication: ${d.name}, ${d.dose}${d.note ? ` (${d.note})` : ''}, scheduled for ${d.time}. Remind him of that specific medicine and dose by name, in one short warm sentence.`
      : `حان الآن موعد دواء الحاج: ${d.name} بجرعة ${d.dose}${d.note ? ` (${d.note})` : ''} في تمام الساعة ${d.time}. ذكّريه باسم الدواء والجرعة تحديداً بجملة قصيرة ودافئة.`;
  } else if (kind === 'drift') {
    const dist = Number(req.body.distance) || 95;
    s.drift.active = true;
    s.drift.distance = dist;
    s.simMode = 'drifting';          // otherwise the location tick pulls him straight back
    if (!s.drift.direction) { s.drift.direction = 'الشمال الشرقي'; s.drift.directionEn = 'north-east'; }
    event = lang === 'en'
      ? `The pilgrim has drifted ${dist} metres from his group. The correct direction back is ${s.drift.directionEn}. Guide him back gently and calmly, without worrying him.`
      : `ابتعد الحاج عن مجموعته مسافة ${dist} متراً. اتجاه العودة الصحيح نحو ${s.drift.direction}. أرشديه بلطف وهدوء دون أن تُقلقيه.`;
  } else if (kind === 'drift_resolved') {
    s.drift.active = false;
    s.drift.distance = 4;
    s.simMode = 'with_group';
    event = lang === 'en'
      ? 'The pilgrim has rejoined his group. Reassure him in one very short sentence, then continue guiding him through the current Tawaf step.'
      : 'عاد الحاج إلى مجموعته بنجاح. طمئنيه بجملة قصيرة جداً ثم أكملي إرشاده في خطوة الطواف الحالية.';
  } else if (kind === 'fall') {
    event = lang === 'en'
      ? 'The motion sensor in his earpiece has detected a sudden fall, and he has not moved for several seconds. Speak to him immediately, calmly, checking whether he is hurt. This is a distress signal: ask him clearly whether he needs help, and set action = ask_confirm_distress. Do NOT raise an alert until he confirms.'
      : 'رصد مستشعر الحركة في سماعته سقوطاً مفاجئاً، ولم يتحرك منذ عدة ثوانٍ. كلّميه فوراً وبهدوء واطمئني عليه. هذه إشارة ضائقة: اسأليه بوضوح إن كان يحتاج مساعدة واجعلي action = ask_confirm_distress، ولا تُطلقي أي إنذار قبل تأكيده.';
  } else {
    return res.status(400).json({ error: 'unknown trigger' });
  }

  S.bus.emit('proactive', { pilgrimId: pilgrim.id, kind, event, manual: true, brief: !!req.body.brief });
  res.json({ ok: true, kind });
});

// تثبيت نقطة المجموعة عند الموقع الحالي
app.post('/api/location/anchor', (req, res) => {
  const pilgrim = findPilgrim(req.body.pilgrimId) || demoPilgrim();
  const s = S.anchorGroupHere(pilgrim);
  res.json({ ok: true, group: s.group, distance: s.drift.distance });
});

const GREETING = {
  en: (p) =>
    `Peace be upon you, Hajj ${(p.name_en || 'Mohammad').split(' ')[1] || 'Mohammad'}. I'm Sakeenah, and I'll be with you through your Tawaf, step by step. Whenever you need anything, just speak to me. Are you ready to begin?`,
  ar: (p) =>
    `السلام عليكم يا حاج ${(p.name || '').split(' ')[1] || 'محمد'}، أنا سكينة وسأكون معك في طوافك خطوة بخطوة. متى احتجت شيئاً فكلّمني. هل أنت جاهز لنبدأ؟`
};

async function emitGreeting(pilgrim, lang) {
  const s = S.getSession(pilgrim);
  const reply = GREETING[lang === 'en' ? 'en' : 'ar'](pilgrim);
  s.history.push({ role: 'sakeenah', text: reply });
  const buf = await tts.synthesize(reply, { lang }).catch(() => null);
  io.emit('proactive-speak', {
    pilgrimId: pilgrim.id,
    kind: 'greeting',
    reply,
    action: 'none',
    audio: buf ? buf.toString('base64') : null,
    at: timeLabel()
  });
}

/* --------------------- الأحداث الاستباقية من الخادم ------------------- */
// حارس: لا نسمح بأكثر من حدث استباقي واحد كل بضع ثوانٍ لكل حاج
const lastProactive = new Map();
const PROACTIVE_COOLDOWN_MS = Number(process.env.PROACTIVE_COOLDOWN_MS || 6000);
S.bus.on('proactive', async ({ pilgrimId, kind, event, manual, brief }) => {
  const pilgrim = findPilgrim(pilgrimId);
  if (!pilgrim) return;

  // الضغط اليدوي لا يُكبَح · a deliberate press is never swallowed; the cooldown
  // exists to stop the automatic timers stacking up, not to slow the presenter.
  const now = Date.now();
  const prev = lastProactive.get(pilgrimId) || 0;
  if (!manual && now - prev < PROACTIVE_COOLDOWN_MS) {
    console.warn(`[PROACTIVE] skipped "${kind}" — cooldown`);
    return;
  }
  lastProactive.set(pilgrimId, now);

  try {
    const out = await runTurn({ pilgrim, event, kind, brief });
    const sess = S.getSession(pilgrim);
    const buf = await tts.synthesize(out.reply, { lang: sess.lang }).catch(() => null);
    io.emit('proactive-speak', {
      pilgrimId,
      kind,
      reply: out.reply,
      action: out.action,
      audio: buf ? buf.toString('base64') : null,
      at: timeLabel()
    });
  } catch (e) {
    console.error(`[PROACTIVE] ${kind}: ${e.message}`);
    io.emit('proactive-error', { pilgrimId, kind, error: e.message, code: e.code || null });
  }
});

/* --------- تسخين الصوت · pre-render every fixed line into the cache -------
   The scripted beats then play with no synthesis wait at all on stage.        */
(async function warmVoices() {
  if (process.env.SAKEENAH_NO_WARMUP === '1') return;
  const lines = instant.warmupLines(demoPilgrim());
  let done = 0;
  for (const l of lines) {
    try { await tts.synthesize(l.text, { lang: l.lang }); done++; } catch (_) { /* offline is fine */ }
  }
  if (done) console.log(`  الصوت مُسخَّن · voice pre-warmed: ${done}/${lines.length} lines cached`);
})();

/* ------------------------------- المؤقتات ---------------------------- */
setInterval(() => {
  for (const p of DB.pilgrims) S.tickLocation(p);

  // حالة كل الحجاج للوحة الحملة · every pilgrim's state, for the campaign board
  io.emit('roster-state', DB.pilgrims.map((p) => {
    const ps = S.getSession(p);
    return {
      id: p.id,
      active: ps.active,
      distance: Math.round(ps.drift.distance || 0),
      drifting: !!ps.drift.active,
      thresholdM: ps.thresholdM,
      step: ps.step
    };
  }));
  const d = demoPilgrim();
  const s = S.getSession(d);
  if (s.active) {
    io.emit('location', {
      pilgrimId: d.id,
      distance: s.drift.distance,
      drifting: s.drift.active,
      simMode: s.simMode,
      source: s.locationSource,
      accuracy: s.accuracy,
      thresholdM: s.thresholdM
    });
  }
}, 2000);

setInterval(() => {
  for (const p of DB.pilgrims) S.tickMedications(p);
}, 10000);

/* -------------------------------- Socket ----------------------------- */
io.on('connection', (socket) => {
  socket.emit('bootstrap', {
    alerts,
    events: eventLog.slice(-40),
    resolvedIncidents: DB.resolvedIncidents,
    campaign: DB.campaign
  });
});

server.listen(PORT, () => {
  console.log('');
  console.log('  Sakeenah · سكينة — running');
  console.log('  ──────────────────────────────────────────────────────');
  console.log(`  Pilgrim app     تطبيق الحاج   →  http://localhost:${PORT}/app`);
  console.log(`  Campaign board  لوحة الحملة   →  http://localhost:${PORT}/web`);
  console.log(`  Film · board    اللوحة        →  http://localhost:${PORT}/film/web`);
  console.log(`  Film · phone    الهاتف        →  http://localhost:${PORT}/film/phone`);
  console.log('  ──────────────────────────────────────────────────────');
  console.log(`  Gemini: ${process.env.GEMINI_API_KEY ? 'مفتاح موجود ✓' : 'لا يوجد مفتاح ✗ (ضعه في .env)'}`);
  console.log(`  Voice EN: ${tts.describe('en')}`);
  console.log(`  Voice AR: ${tts.describe('ar')}`);
  console.log(
    `  Auto-timers: medication ${S.DEMO_MED_AFTER_SECONDS}s · drift ${S.DRIFT_AFTER_SECONDS}s` +
    (S.DEMO_MED_AFTER_SECONDS === 0 && S.DRIFT_AFTER_SECONDS === 0 ? '  (both off — good for recording)' : '')
  );
  console.log('  Recording? Open a film set, press F11, then Start the film.');
  console.log('');
});
