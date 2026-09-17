'use strict';
/* Sakeenah — the phone app.
   Markup and inline styles are the Claude Design export, unchanged.
   The React runtime underneath it is gone; every state below is driven by
   the real server: real microphone, real Gemini, real edge-tts, real GPS. */

/* ----------------------------- constants ----------------------------- */
const GREEN = '#1F4A36', BROWN = '#6B4A2E', AMBER = '#8A5A10', RED = '#9E2F1C', GOLD = '#B8862B';
const ICON = {
  home: 'M3 10.5 12 3l9 7.5V21H3z',
  mic: 'M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3M5 10v2a7 7 0 0 0 14 0v-2',
  pill: 'M10.5 20.5a6 6 0 0 1-8.5-8.5l9-9a6 6 0 0 1 8.5 8.5z',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'
};

const EN = {
  dir: 'ltr', font: 'Inter, sans-serif', track: '0.08em', caps: 'uppercase', lh: '1.6', chevron: '›',
  brand: 'Sakeenah', you: 'You', group: 'Group',
  pairTitle: 'Connect his earbuds',
  pairBody: 'Any wireless earbuds work — she speaks through them and hears him. Turn them on and hold them near the phone.',
  scanIdle: 'Ready to look for nearby earbuds', scanBusy: 'Looking for earbuds nearby…', scanFound: 'Choose the earbuds he is wearing',
  scanCtaIdle: 'Scan for earbuds', scanCtaBusy: 'Scanning…', scanCtaAgain: 'Scan again',
  connect: 'Connect', connecting: 'Connecting…', connectedTag: 'Connected', continueCta: 'Continue to his day',
  greetKicker: 'Peace be upon you', greetName: 'Hajj Mohammad', startCta: 'Start session',
  startHint: 'She greets him and begins the next step',
  stopCta: 'End session', stopHint: 'She stops listening',
  askLabel: 'He can ask her', convoLabel: 'Conversation',
  convoEmpty: 'Start the session and her first words appear here.',
  simulateCta: 'Simulate distress phrase',
  medsTitle: 'His medicines', medsBody: 'She names each one at its time, in his own language.',
  tookIt: 'He took it', taken: 'Taken', medsSheLabel: 'If he asks now',
  safetyTitle: 'His group and his safety',
  safetyBody: 'Distance is checked continuously. She guides him back long before anyone calls it lost.',
  contactLabel: 'Emergency contact',
  consentNote: 'Nothing is ever sent until she has asked him and he has said yes.',
  logLabel: 'What was sent', resolveCta: 'Mark as resolved',
  askingKicker: 'She has asked him — and stopped', askingTitle: '“Do you need help?”',
  askingNote: 'Nothing has been sent. Nothing will be, until he answers. He decides.',
  yesCta: 'Yes, please help me', noCta: 'No, I’m alright',
  tabs: ['Home', 'Voice', 'Medicines', 'Safety'],
  she: 'Sakeenah', he: 'Hajj Mohammad',
  asks: ['Is it time for my medicine?', 'How many circuits are left?', 'How far am I from my group?'],
  driftOn: 'Simulate drifting from the group', driftOff: 'He rejoined the group',
  micIdle: 'Tap to speak', micIdleHint: 'Or simply speak — she is listening throughout the session.',
  micListen: 'Listening…', micListenHint: 'The ring breathes at 1.7s. He can take as long as he needs.',
  micThink: 'One moment, Hajj…', micThinkHint: 'Understanding, then answering in her own voice.',
  micSpeak: 'Speaking…', micSpeakHint: 'Calm, slow, unhurried.',
  micOff: 'Session not started', micOffHint: 'Press Start session on the Home tab first.',
  sessionOn: 'Session running', sessionOff: 'Session not started',
  awaiting: 'Awaiting his answer', nothingSent: 'Nothing has been sent yet',
  confirmed: 'Emergency confirmed', helpComing: 'Help is on its way',
  tawaf: (n) => `Tawaf ${n} of 7 · Kaaba on his left`,
  nextDose: 'Next medicine', groupCard: 'His group', deviceCard: 'His earbuds',
  scheduled: 'Scheduled', dueNow: 'Due now — she will say it aloud', takenNow: 'Taken just now',
  takenEarlier: 'Taken earlier today', overdue: 'Overdue — she has reminded him',
  inside: (d, t) => `${d} metres — inside the ${t}-metre threshold.`,
  outside: (d, b) => `${d} metres, ${b}. She is walking him back.`,
  noEarbuds: 'No earbuds connected', connectedTo: 'Connected · ',
  micDenied: 'Microphone blocked. Allow it in Chrome and scan again.',
  speak: 'Replay',
  notStartedLine: 'Start her from the Home tab',
  insideThreshold: 'inside the threshold', bothLive: 'Her voice and his, both live',
  triggers: 'Demo triggers',
  trigMed: 'Medication reminder', trigDrift: 'Drifted from group',
  trigBack: 'Rejoined group', trigFall: 'Fall detected',
  useSafari: 'Open this page in Safari — on iPhone, only Safari can use the microphone.',
  tapToTalk: 'Tap, then speak', tapHint: 'Tap the circle, say one sentence, then wait.',
  micIosAllow: 'Safari blocked the microphone. Tap aA in the address bar \u2192 Website Settings \u2192 Microphone \u2192 Allow, then reload.',
  micDictation: 'Turn on Dictation: Settings \u2192 General \u2192 Keyboard \u2192 Enable Dictation. Speech recognition needs it.',
  micNetwork: 'Speech recognition lost the network. Tap the circle to try again.',
  noRecognition: 'This browser cannot listen. On iPhone use Safari \u2014 Chrome and Edge cannot.',
  srReady: 'Speech recognition ready', srMissing: 'No speech recognition in this browser',
  answerAloud: 'Answer her out loud \u2014 she is listening',
  tapToAnswer: 'Tap here, then answer her out loud'
};

const AR = {
  dir: 'rtl', font: "'IBM Plex Sans Arabic', sans-serif", track: 'normal', caps: 'none', lh: '1.9', chevron: '‹',
  brand: 'سكينة', you: 'أنت', group: 'المجموعة',
  pairTitle: 'وصّل سمّاعاته',
  pairBody: 'أي سمّاعات لاسلكية تكفي — تتحدث عبرها وتسمعه. شغّلها وقرّبها من الهاتف.',
  scanIdle: 'جاهزة للبحث عن سمّاعات قريبة', scanBusy: 'تبحث عن سمّاعات قريبة…', scanFound: 'اختر السمّاعات التي يلبسها',
  scanCtaIdle: 'ابحث عن السمّاعات', scanCtaBusy: 'تبحث…', scanCtaAgain: 'ابحث مرة أخرى',
  connect: 'وصّل', connecting: 'يتصل…', connectedTag: 'متصلة', continueCta: 'تابع إلى يومه',
  greetKicker: 'السلام عليكم', greetName: 'الحاج محمد', startCta: 'ابدأ الجلسة',
  startHint: 'ترحّب به وتبدأ الخطوة التالية',
  stopCta: 'إنهاء الجلسة', stopHint: 'تتوقف عن الاستماع',
  askLabel: 'يمكنه أن يسألها', convoLabel: 'المحادثة',
  convoEmpty: 'ابدأ الجلسة وستظهر أول كلماتها هنا.',
  simulateCta: 'محاكاة عبارة ضيق',
  medsTitle: 'أدويته', medsBody: 'تسمّي كل دواء في وقته، بلغته.',
  tookIt: 'أخذه', taken: 'أُخذ', medsSheLabel: 'لو سأل الآن',
  safetyTitle: 'مجموعته وسلامته',
  safetyBody: 'المسافة تُفحص باستمرار. تعيده بهدوء قبل أن يسمّيه أحد تائهًا.',
  contactLabel: 'جهة الاتصال للطوارئ',
  consentNote: 'لا يُرسل شيء أبدًا حتى تسأله ويقول نعم.',
  logLabel: 'ما الذي أُرسل', resolveCta: 'وسم الحالة كمُنتهية',
  askingKicker: 'سألته — ثم توقفت', askingTitle: '«هل تحتاج مساعدة؟»',
  askingNote: 'لم يُرسل شيء. ولن يُرسل، حتى يجيب. القرار له.',
  yesCta: 'نعم، أحتاج مساعدة', noCta: 'لا، أنا بخير',
  tabs: ['الرئيسية', 'الصوت', 'الأدوية', 'السلامة'],
  she: 'سكينة', he: 'الحاج محمد',
  asks: ['هل حان وقت دوائي؟', 'كم شوطًا بقي؟', 'كم أبعد عن مجموعتي؟'],
  driftOn: 'محاكاة الابتعاد عن المجموعة', driftOff: 'عاد إلى المجموعة',
  micIdle: 'اضغط للتحدث', micIdleHint: 'أو تحدث فقط — هي تسمع دائمًا في الجلسة.',
  micListen: 'تستمع…', micListenHint: 'الحلقة تتنفس كل ١٫٧ ثانية. له كل الوقت.',
  micThink: 'لحظة يا حاج…', micThinkHint: 'تفهم ثم تجيب بصوتها.',
  micSpeak: 'تتحدث…', micSpeakHint: 'هادئة، بطيئة، غير مستعجلة.',
  micOff: 'الجلسة لم تبدأ', micOffHint: 'اضغط «ابدأ الجلسة» في الصفحة الرئيسية أولًا.',
  sessionOn: 'الجلسة تعمل', sessionOff: 'الجلسة لم تبدأ',
  awaiting: 'في انتظار جوابه', nothingSent: 'لم يُرسل شيء بعد',
  confirmed: 'تأكيد الحالة', helpComing: 'المساعدة في الطريق',
  tawaf: (n) => `الشوط ${ar(n)} من ٧ · الكعبة عن يساره`,
  nextDose: 'الدواء القادم', groupCard: 'مجموعته', deviceCard: 'سمّاعاته',
  scheduled: 'مجدول', dueNow: 'الآن — ستقولها بصوتها', takenNow: 'أخذه الآن',
  takenEarlier: 'أُخذ سابقًا اليوم', overdue: 'متأخر — ذكّرته',
  inside: (d, t) => `${ar(d)} مترًا — داخل حدّ ${ar(t)} مترًا.`,
  outside: (d, b) => `${ar(d)} مترًا، ${b}. تعيده الآن.`,
  noEarbuds: 'لا سمّاعات متصلة', connectedTo: 'متصلة · ',
  micDenied: 'الميكروفون محجوب. اسمح به في كروم ثم ابحث مرة أخرى.',
  speak: 'إعادة',
  notStartedLine: 'ابدأها من الصفحة الرئيسية',
  insideThreshold: 'داخل الحد', bothLive: 'صوتها وصوته، كلاهما حاضر',
  triggers: 'مشغّلات العرض',
  trigMed: 'تذكير بالدواء', trigDrift: 'ابتعد عن المجموعة',
  trigBack: 'عاد إلى المجموعة', trigFall: 'رصد سقوط',
  useSafari: 'افتح هذه الصفحة في سفاري — على الآيفون، سفاري وحده يستطيع استخدام الميكروفون.',
  tapToTalk: 'اضغط ثم تحدّث', tapHint: 'اضغط الدائرة، قل جملة واحدة، ثم انتظر.',
  micIosAllow: 'سفاري حجب الميكروفون. اضغط aA في شريط العنوان \u2190 إعدادات الموقع \u2190 الميكروفون \u2190 السماح، ثم أعد التحميل.',
  micDictation: 'فعّل الإملاء: الإعدادات \u2190 عام \u2190 لوحة المفاتيح \u2190 تفعيل الإملاء. التعرّف على الصوت يحتاجه.',
  micNetwork: 'انقطع اتصال التعرّف على الصوت. اضغط الدائرة للمحاولة مرة أخرى.',
  noRecognition: 'هذا المتصفح لا يستطيع الاستماع. على الآيفون استخدم سفاري \u2014 كروم لا يستطيع.',
  srReady: 'التعرّف على الصوت جاهز', srMissing: 'لا يوجد تعرّف على الصوت في هذا المتصفح',
  answerAloud: 'أجبها بصوتك \u2014 هي تستمع',
  tapToAnswer: 'اضغط هنا ثم أجبها بصوتك'
};

/* ما الذي يستطيعه هذا الجهاز · what this device can actually do.
   On iPhone every browser is Safari underneath, and only Safari itself
   exposes speech recognition — Chrome and Edge on iOS do not. */
const FILM_MODE = new URLSearchParams(location.search).has('film');
if (FILM_MODE) document.body.classList.add('film');

const UA = navigator.userAgent;
const IS_IOS = /iP(hone|ad|od)/.test(UA) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const IS_IOS_OTHER_BROWSER = IS_IOS && /CriOS|FxiOS|EdgiOS|OPiOS/.test(UA);
const HAS_SR = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

const ar = (v) => String(v).replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[+d]);
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ------------------------------- state ------------------------------- */
const state = {
  lang: localStorage.getItem('sk-lang') === 'ar' ? 'ar' : 'en',
  tab: 'pair',
  scan: 'idle',            // idle | busy | found
  devices: [],             // real audio inputs
  budIndex: -1,
  connecting: -1,
  micDenied: false,
  active: false,           // session running
  mic: 'off',              // off | idle | listening | thinking | speaking
  turns: [],
  asking: false,
  incident: false,
  resolved: false,
  log: [],
  taken: {},               // "Metformin@20:00" -> true
  drift: { active: false, distance: 0, bearing: '' },
  threshold: 40,
  step: 1,
  pilgrim: null,
  campaign: null,
  banner: null             // transient error line
};

const L = () => (state.lang === 'ar' ? AR : EN);
const isAr = () => state.lang === 'ar';
const num = (v) => (isAr() ? ar(v) : String(v));

/* --------------------------- Makkah clock ---------------------------- */
function makkahNow() {
  const f = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Riyadh', hour: '2-digit', minute: '2-digit', hour12: false
  });
  return f.format(new Date());               // "16:04"
}
const toMin = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };

/* ------------------------ medication schedule ------------------------ */
function doseList() {
  const p = state.pilgrim;
  if (!p) return [];
  const nowM = toMin(makkahNow());
  const out = [];
  for (const med of p.medications || []) {
    const name = isAr() ? med.name : (med.name_en || med.name);
    const dose = isAr() ? med.dose : (med.dose_en || med.dose);
    for (const t of med.times || []) {
      const key = `${med.name_en || med.name}@${t}`;
      const mins = toMin(t);
      const delta = nowM - mins;
      out.push({ key, at: t, label: `${name} ${dose}`, mins, delta });
    }
  }
  out.sort((a, b) => a.mins - b.mins);
  return out.map((d) => {
    const took = !!state.taken[d.key];
    // due window: from 10 min before, until 60 min after
    const due = !took && d.delta >= -10 && d.delta <= 60;
    const past = d.delta > 60;
    const t = L();
    let stateLabel;
    if (took) stateLabel = d.delta > 60 ? t.takenEarlier : t.takenNow;
    else if (due) stateLabel = d.delta > 20 ? t.overdue : t.dueNow;
    else if (past) stateLabel = t.takenEarlier;
    else stateLabel = t.scheduled;
    return { ...d, took, due, done: took || past, state: stateLabel };
  });
}
function nextDose() {
  const list = doseList();
  const nowM = toMin(makkahNow());
  return list.find((d) => d.due) || list.find((d) => d.mins > nowM) || list[0] || null;
}

/* ------------------------------ audio ------------------------------- */
const player = document.getElementById('sk-player');

/* iOS لا يشغّل أي صوت قبل لمسة المستخدم · iOS will not play any audio until the
   person has touched the page, so the first touch unlocks the element. */
let audioUnlocked = false;
function unlockAudio() {
  if (audioUnlocked) return;
  audioUnlocked = true;
  try {
    player.muted = true;
    player.src = 'data:audio/mp4;base64,AAAAHGZ0eXBNNEEgAAACAGlzb21pc28yTTRBIAAAAAhmcmVlAAAAG21kYXQAAAGzABAHAAABthADAowdbb9/AAAC6W1vb3YAAABsbXZoZAAAAAB8JbCAfCWwgAAAA+gAAAAeAAEAAAEAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAhV0cmFrAAAAXHRraGQAAAAPfCWwgHwlsIAAAAABAAAAAAAAAB4AAAAAAAAAAAAAAAABAQAAAAABAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAA';
    const p = player.play();
    if (p && p.catch) p.catch(() => {});
    setTimeout(() => { try { player.pause(); player.muted = false; player.removeAttribute('src'); } catch (_) {} }, 60);
  } catch (_) { player.muted = false; }
}
document.addEventListener('pointerdown', unlockAudio, { once: true });
document.addEventListener('touchstart', unlockAudio, { once: true });
let lastAudio = null;

function playB64(b64) {
  if (!b64) return Promise.resolve();
  lastAudio = b64;
  // نُسند base64 مباشرة كـ data URL · hand the base64 straight to the element as a
  // data URL. Safari's atob() throws "The string did not match the expected
  // pattern" on payloads this size, and decoding by hand bought us nothing.
  try {
    player.src = 'data:audio/mpeg;base64,' + b64;
  } catch (e) {
    state.banner = 'Her voice could not be loaded, but her words are above.';
    render();
    return Promise.resolve();
  }
  return player.play().catch(() => {
    state.banner = 'Tap anywhere once, then press Replay — the browser blocks sound until you do.';
    render();
  });
}
player.addEventListener('ended', () => {
  if (state.mic !== 'speaking') return;
  if (!state.active) return setMic('idle');
  // بعد أن تنتهي من الكلام، عودي إلى الاستماع فعلاً — لا أن تبدو مستمعة فقط.
  // When she stops speaking, actually listen again rather than only looking
  // like it. On iOS recognition cannot restart without a fresh tap, so the
  // circle honestly says "tap, then speak" instead of claiming to listen.
  // بعد أن تسأل "هل تحتاج مساعدة؟" تبقى مستمعة — الجواب يُقال، لا يُضغط.
  // After she asks "Do you need help?" she keeps listening. The answer is
  // spoken, not tapped; the buttons stay only as a fallback for a noisy room.
  if (IS_IOS) {
    // Safari refuses to restart without a fresh tap, so try, and if it throws
    // the sheet shows a tap-to-answer button instead.
    try { startListening(); } catch (_) { setMic('idle'); }
    return;
  }
  startListening();
});

/* --------------------------- speech input ---------------------------- */
let recog = null, wantListening = false;
let lastHeard = '', lastHeardAt = 0;

function makeRecognizer() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return null;
  const r = new SR();
  r.lang = isAr() ? 'ar-SA' : 'en-US';
  r.continuous = false;
  r.interimResults = false;
  r.maxAlternatives = 1;
  r.onresult = (e) => {
    const text = (e.results[0][0].transcript || '').trim();
    if (!text) return;
    sendText(text);
  };
  r.onerror = (e) => {
    if (e.error === 'not-allowed') {
      state.micDenied = true;
      state.banner = IS_IOS ? L().micIosAllow : L().micDenied;
    } else if (e.error === 'service-not-allowed') {
      // على iOS هذا يعني أن الإملاء مُعطَّل في الإعدادات، لا أن الإذن مرفوض
      state.micDenied = true;
      state.banner = IS_IOS ? L().micDictation : L().micDenied;
    } else if (e.error === 'network') {
      state.banner = L().micNetwork;
    } else if (e.error !== 'no-speech' && e.error !== 'aborted') {
      state.banner = 'Microphone: ' + e.error;
    }
    if (e.error !== 'no-speech' && e.error !== 'aborted') { wantListening = false; setMic('idle'); }
    else if (IS_IOS) setMic('idle');
  };
  r.onend = () => {
    // على iOS كل ضغطة = جملة واحدة · on iOS one tap is one utterance;
    // restarting without a fresh gesture is refused by Safari.
    if (IS_IOS) { wantListening = false; if (state.mic === 'listening') setMic('idle'); return; }
    if (wantListening && state.mic === 'listening') { try { r.start(); } catch (_) {} }
  };
  return r;
}
function startListening() {
  if (!state.active) return;
  wantListening = true;
  if (!recog) recog = makeRecognizer();
  if (!recog) { state.banner = 'This browser has no speech recognition — use Chrome.'; return render(); }
  recog.lang = isAr() ? 'ar-SA' : 'en-US';
  try { recog.start(); } catch (_) {}
  setMic('listening');
}
function stopListening() {
  wantListening = false;
  if (recog) { try { recog.abort(); } catch (_) {} }
}
function setMic(m) { state.mic = m; render(); }

/* ------------------------------ network ------------------------------ */
const api = (url, body) =>
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {})
  }).then((r) => r.json());

function pushTurn(who, text) {
  state.turns.push({ who, text, at: makkahNow(), fresh: true });
  if (state.turns.length > 40) state.turns.shift();
}

async function sendText(text) {
  if (!state.active) return;
  // سفاري قد يُطلق النتيجة مرتين · Safari can deliver the same result twice,
  // and a double tap does the same. One sentence, one turn.
  const now = Date.now();
  if (text === lastHeard && now - lastHeardAt < 4000) return;
  lastHeard = text; lastHeardAt = now;
  stopListening();
  pushTurn('he', text);
  setMic('thinking');
  try {
    const out = await api('/api/chat', {
      pilgrimId: state.pilgrim.id, text, lang: state.lang
    });
    if (out.error) throw new Error(out.error);
    handleReply(out);
  } catch (e) {
    const q = /quota|429/i.test(e.message);
    state.banner = q
      ? 'She is out of requests for today — the buttons below all still work.'
      : 'She could not answer that one. Try again, or use a button below.';
    console.warn('[chat]', e);
    setMic(state.active ? 'listening' : 'idle');
    if (state.active) startListening();
  }
}

function handleReply(out) {
  pushTurn('she', out.reply);
  if (out.action === 'ask_confirm_distress') { state.asking = true; state.tab = 'voice'; }
  if (out.action === 'confirmed_emergency') { state.asking = false; state.incident = true; state.resolved = false; state.tab = 'safety'; }
  if (out.audio) {
    setMic('speaking');            // her words are on screen before any audio is touched
    try { playB64(out.audio).catch(() => {}); } catch (_) { setMic('idle'); }
  } else {
    if (state.active && !IS_IOS) startListening();
    else setMic(state.active ? 'idle' : 'idle');
  }
  render();
}

/* ------------------------------ actions ------------------------------ */
async function doScan() {
  state.scan = 'busy'; state.banner = null; render();
  try {
    // real permission prompt + real device list
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((t) => t.stop());
    state.micDenied = false;
    const all = await navigator.mediaDevices.enumerateDevices();
    state.devices = all.filter((d) => d.kind === 'audioinput')
      .map((d, i) => ({ id: d.deviceId, name: d.label || `Audio input ${i + 1}` }));
  } catch (e) {
    state.micDenied = true;
    state.banner = L().micDenied;
    state.devices = [];
  }
  state.scan = 'found';
  render();
}

function connectDevice(i) {
  state.connecting = i; render();
  setTimeout(() => { state.connecting = -1; state.budIndex = i; render(); }, 700);
}

async function startSession() {
  state.banner = null;
  const r = await api('/api/session/start', { pilgrimId: state.pilgrim.id, lang: state.lang });
  state.active = true;
  state.step = r.step || 1;
  state.turns = [];
  state.tab = 'voice';
  setMic('thinking');       // greeting arrives over the socket
}

async function stopSession() {
  stopListening();
  await api('/api/session/stop', { pilgrimId: state.pilgrim.id });
  state.active = false;
  setMic('off');
}

async function toggleDrift() {
  const mode = state.drift.active ? 'with_group' : 'drifting';
  await api('/api/sim/location', { pilgrimId: state.pilgrim.id, mode });
}

function simulateDistress() {
  if (!state.active) { state.banner = L().micOffHint; return render(); }
  sendText(isAr() ? 'أنا تعبان… ما أقدر أتنفس زين' : "I'm so tired… I can't breathe.");
}

function sayYes() { state.asking = false; sendText(isAr() ? 'نعم، أحتاج مساعدة' : 'Yes, please help me.'); }
function sayNo() { state.asking = false; sendText(isAr() ? 'لا، أنا بخير' : "No, I'm alright."); }
function resolveIncident() { state.incident = false; state.resolved = true; state.log = []; render(); }

function setLang(l) {
  if (state.lang === l) return;
  state.lang = l;
  localStorage.setItem('sk-lang', l);
  api('/api/session/lang', { pilgrimId: state.pilgrim.id, lang: l }).catch(() => {});
  if (recog) { stopListening(); recog = null; if (state.active) startListening(); }
  render();
}

/* ------------------------------- render ------------------------------ */
const app = document.getElementById('sk-app');
const F = () => L().font;

function header() {
  const t = L(), a = isAr();
  const bud = (FILM_MODE
    ? (isAr() ? 'سمّاعة سكينة SK-1042' : 'Sakeenah Earpiece SK-1042')
    : (state.devices[state.budIndex] && state.devices[state.budIndex].name) || '');
  const budLine = state.budIndex > -1 ? t.connectedTo + bud : t.noEarbuds;
  const enBg = a ? 'transparent' : '#FDF8EF', enFg = a ? '#FDF8EF' : '#143527';
  const arBg = a ? '#FDF8EF' : 'transparent', arFg = a ? '#143527' : '#FDF8EF';
  return `
  <div style="flex:none;background:#1F4A36;padding:58px 20px 16px;display:flex;align-items:center;justify-content:space-between;gap:12px">
    <div style="display:flex;align-items:center;gap:10px;min-width:0">
      <svg width="34" height="34" viewBox="0 0 120 120" role="img" aria-label="Sakeenah" style="display:block;flex:none">
        <path d="M60 4c34 0 56 20 56 56s-22 56-56 56S4 94 4 60 26 4 60 4z" fill="#FDF8EF"></path>
        <g transform="rotate(-18 60 60)">
          <path d="M50 28C66 46 66 74 50 92C34 74 34 46 50 28Z" fill="#1F4A36"></path>
          <path d="M70 28C86 46 86 74 70 92C54 74 54 46 70 28Z" fill="#B8862B"></path>
        </g>
      </svg>
      <div style="display:flex;flex-direction:column;min-width:0">
        <span style="font-size:20px;font-weight:700;color:#FDF8EF;line-height:1.2">${esc(t.brand)}</span>
        <span style="font-size:15px;color:#DCB054;line-height:1.3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(budLine)}</span>
      </div>
    </div>
    <div style="display:flex;gap:8px;flex:none">
      <button type="button" class="sk-f-gold" data-act="lang" data-arg="en" style="font-family:Inter,sans-serif;font-size:16px;font-weight:700;border-radius:999px;min-height:44px;min-width:48px;cursor:pointer;border:2px solid #2C6349;background:${enBg};color:${enFg}">EN</button>
      <button type="button" class="sk-f-gold" data-act="lang" data-arg="ar" style="font-family:'IBM Plex Sans Arabic',sans-serif;font-size:16px;font-weight:700;border-radius:999px;min-height:44px;min-width:48px;cursor:pointer;border:2px solid #2C6349;background:${arBg};color:${arFg}">ع</button>
    </div>
  </div>`;
}

function pairPanel() {
  const t = L();
  const connected = state.budIndex > -1;
  const busy = state.scan === 'busy';
  const scanBg = busy || connected ? GREEN : '#F5ECDB';
  const scanLine = busy ? GOLD : connected ? GREEN : BROWN;
  const scanIcon = busy || connected ? '#FDF8EF' : GREEN;
  const scanLabel = connected ? (isAr() ? 'متصلة وجاهزة' : 'Connected and ready')
    : busy ? t.scanBusy : state.scan === 'found' ? t.scanFound : t.scanIdle;
  const scanCta = busy ? t.scanCtaBusy : state.scan === 'found' ? t.scanCtaAgain : t.scanCtaIdle;

  const designed = isAr()
    ? [
        { name: 'سمّاعة سكينة SK-1042', meta: 'المجموعة أ · البطارية ٨٤٪', tag: 'جاهزة بالكامل · صوت وأدوية وحساسات', ready: true },
        { name: 'سمّاعاته اللاسلكية', meta: 'بلوتوث · البطارية ٦١٪', tag: 'تعمل للصوت كاملًا · بلا حساس سقوط', ready: false },
        { name: 'مكبّر صوت الخيمة', meta: 'بلوتوث · في المخيم', tag: 'للصوت فقط · غير محمولة', ready: false }
      ]
    : [
        { name: 'Sakeenah Earpiece SK-1042', meta: 'Group A · battery 84%', tag: 'Sakeenah-ready · voice, medicines, sensors', ready: true },
        { name: 'His own wireless earbuds', meta: 'Bluetooth · battery 61%', tag: 'Works fully for voice · no fall sensing', ready: false },
        { name: 'Bedside speaker', meta: 'Bluetooth · in the camp', tag: 'Voice only · not worn', ready: false }
      ];
  const list = FILM_MODE ? designed : state.devices;
  const rows = state.scan === 'found' ? list.map((d, i) => {
    const isC = state.budIndex === i, isBusy = state.connecting === i;
    const ready = d.ready != null ? d.ready : i === 0;
    const line = isC ? GREEN : ready ? GOLD : BROWN;
    const tag = d.tag || (ready
      ? (isAr() ? 'يعمل للصوت · لا استشعار سقوط' : 'Works fully for voice · no fall sensing')
      : (isAr() ? 'صوت فقط' : 'Voice only'));
    return `
    <button type="button" class="sk-btn-row sk-f" data-act="connect" data-arg="${i}" style="font-family:${F()};text-align:start;background:${isC ? '#F5ECDB' : '#FDF8EF'};border:2px solid ${line};border-radius:24px;padding:18px 20px;cursor:pointer;display:flex;gap:14px;align-items:center;animation:sk-row 260ms ease-out both">
      <span style="flex:none;width:52px;height:52px;border-radius:999px;background:${isC ? GREEN : '#F5ECDB'};border:2px solid ${line};display:flex;align-items:center;justify-content:center">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="${isC ? '#FDF8EF' : GREEN}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 18a3 3 0 0 0 3-3V8a5 5 0 1 0-6 4.9"></path><path d="M18 18a3 3 0 0 1-3-3V8a5 5 0 1 1 6 4.9"></path></svg>
      </span>
      <span style="display:flex;flex-direction:column;gap:3px;min-width:0;flex:1">
        <span style="font-size:19px;font-weight:700;line-height:1.3;color:#143527">${esc(d.name)}</span>
        <span style="font-size:16px;color:#4A3220;line-height:1.4">${esc(d.meta || (isAr() ? 'مدخل صوت على هذا الجهاز' : 'Audio input on this device'))}</span>
        <span style="font-size:16px;font-weight:600;color:${ready ? AMBER : '#4A3220'}">${esc(tag)}</span>
      </span>
      <span style="flex:none;font-size:17px;font-weight:700;color:${isC ? GREEN : isBusy ? AMBER : GREEN}">${esc(isC ? t.connectedTag : isBusy ? t.connecting : t.connect)}</span>
    </button>`;
  }).join('') : '';

  return `
  <div style="display:flex;flex-direction:column;gap:18px">
    <div style="display:flex;flex-direction:column;gap:6px">
      <span style="font-size:28px;font-weight:700;line-height:1.2;color:#143527">${esc(t.pairTitle)}</span>
      <span style="font-size:18px;line-height:1.55;color:#4A3220">${esc(t.pairBody)}</span>
    </div>
    <div style="display:flex;flex-direction:column;gap:14px;align-items:center;background:#FDF8EF;border:2px solid #6B4A2E;border-radius:24px;padding:24px 20px">
      <div style="position:relative;width:132px;height:132px;display:flex;align-items:center;justify-content:center">
        ${busy ? '<span style="position:absolute;inset:0;border-radius:999px;border:3px solid #B8862B;animation:sk-scan 1.7s ease-out infinite"></span>' : ''}
        <span style="width:104px;height:104px;border-radius:999px;background:${scanBg};border:3px solid ${scanLine};display:flex;align-items:center;justify-content:center">
          <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="${scanIcon}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m7 7 10 10-5 5V2l5 5L7 17"></path></svg>
        </span>
      </div>
      <span style="font-size:20px;font-weight:700;line-height:1.35;text-align:center;color:#143527">${esc(scanLabel)}</span>
      <span style="font-size:16px;font-weight:600;text-align:center;color:${HAS_SR ? '#2C7A51' : '#9E2F1C'}">${esc(HAS_SR ? t.srReady : t.srMissing)}</span>
      <button type="button" class="sk-btn-green sk-f" data-act="scan" style="font-family:${F()};font-size:19px;font-weight:600;color:#FDF8EF;background:#1F4A36;border:2px solid #1F4A36;border-radius:999px;min-height:60px;padding:0 28px;cursor:pointer;width:100%">${esc(scanCta)}</button>
    </div>
    ${rows}
    ${connected ? `<button type="button" class="sk-btn-green sk-f" data-act="tab" data-arg="home" style="font-family:${F()};font-size:21px;font-weight:600;color:#FDF8EF;background:#1F4A36;border:2px solid #1F4A36;border-radius:999px;min-height:64px;cursor:pointer">${esc(t.continueCta)}</button>` : ''}
  </div>`;
}

function homePanel() {
  const t = L(), p = state.pilgrim;
  const nd = nextDose();
  const cards = [
    { label: t.nextDose, value: nd ? num(nd.at) : '—', note: nd ? nd.label : '', go: 'meds', line: '#C79A3C', ink: AMBER },
    { label: t.groupCard,
      value: num(Math.round(state.drift.distance || 0)) + (isAr() ? ' م' : ' m away'),
      note: (isAr() ? p.groupId : (p.groupId_en || p.groupId)) + ' · ' + t.insideThreshold,
      go: 'safety', line: BROWN, ink: '#143527' },
    { label: t.deviceCard,
      value: state.budIndex > -1 ? t.connectedTag : t.noEarbuds,
      note: state.budIndex > -1 ? t.bothLive : p.earpieceId,
      go: 'pair', line: BROWN, ink: '#143527' }
  ].map((c) => `
    <button type="button" class="sk-btn-row sk-f" data-act="tab" data-arg="${c.go}" style="font-family:${F()};text-align:start;background:#FDF8EF;border:2px solid ${c.line};border-radius:24px;padding:18px 20px;cursor:pointer;display:flex;gap:14px;align-items:center">
      <span style="display:flex;flex-direction:column;gap:3px;flex:1;min-width:0">
        <span style="font-size:17px;font-weight:700;letter-spacing:${t.track};text-transform:${t.caps};color:#4A3220">${esc(c.label)}</span>
        <span style="font-size:24px;font-weight:700;line-height:1.3;color:${c.ink};font-variant-numeric:tabular-nums">${esc(c.value)}</span>
        <span style="font-size:16px;color:#4A3220;line-height:1.45">${esc(c.note)}</span>
      </span>
      <span style="flex:none;font-size:22px;font-weight:700;color:#1F4A36">${t.chevron}</span>
    </button>`).join('');

  const on = state.active;
  return `
  <div style="display:flex;flex-direction:column;gap:18px">
    <div style="display:flex;flex-direction:column;gap:4px">
      <span style="font-size:18px;color:#4A3220">${esc(t.greetKicker)}</span>
      <span style="font-size:28px;font-weight:700;line-height:1.2;color:#143527">${esc(isAr() ? p.name : (p.name_en || p.name))}</span>
      <span style="font-size:18px;color:#4A3220">${esc((isAr() ? 'مكة · ' : 'Makkah · ') + num(makkahNow()) + ' · ' + (isAr() ? p.groupId : (p.groupId_en || p.groupId)))}</span>
    </div>
    <button type="button" class="sk-btn-green sk-f" data-act="${on ? 'stop' : 'start'}" style="font-family:${F()};background:#1F4A36;border:2px solid #1F4A36;border-radius:28px;padding:26px 22px;cursor:pointer;display:flex;flex-direction:column;gap:14px;align-items:center;box-shadow:0 14px 30px -18px rgba(44,35,24,0.7)">
      <span style="width:88px;height:88px;border-radius:999px;background:#143527;border:3px solid #DCB054;display:flex;align-items:center;justify-content:center">
        <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#FDF8EF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><path d="M12 19v3"></path></svg>
      </span>
      <span style="font-size:22px;font-weight:700;color:#FDF8EF;line-height:1.3;text-align:center">${esc(on ? t.stopCta : t.startCta)}</span>
      <span style="font-size:17px;color:#DCB054;text-align:center">${esc(on ? t.stopHint : t.startHint)}</span>
    </button>
    ${cards}
  </div>`;
}

function voicePanel() {
  const t = L();
  const banner = state.asking
    ? { bg: '#FAEDCF', line: AMBER, kick: AMBER, k: t.awaiting, ti: t.nothingSent }
    : state.incident
      ? { bg: '#FBE8E1', line: RED, kick: RED, k: t.confirmed, ti: t.helpComing }
      : { bg: '#FDF8EF', line: BROWN, kick: '#4A3220', k: state.active ? t.sessionOn : t.sessionOff, ti: state.active ? t.tawaf(num(state.step)) : t.notStartedLine };

  const map = {
    off: { bg: '#F5ECDB', line: BROWN, icon: GREEN, anim: 'none', label: t.micOff, hint: t.micOffHint },
    idle: { bg: '#F5ECDB', line: BROWN, icon: GREEN, anim: 'none', label: (IS_IOS && !FILM_MODE) ? t.tapToTalk : t.micIdle, hint: (IS_IOS && !FILM_MODE) ? t.tapHint : t.micIdleHint },
    listening: { bg: GREEN, line: GOLD, icon: '#FDF8EF', anim: 'sk-breathe 1.7s ease-in-out infinite', label: t.micListen, hint: t.micListenHint },
    thinking: { bg: GREEN, line: GOLD, icon: '#FDF8EF', anim: 'none', label: t.micThink, hint: t.micThinkHint },
    speaking: { bg: GREEN, line: GOLD, icon: '#FDF8EF', anim: 'none', label: t.micSpeak, hint: t.micSpeakHint }
  };
  const m = map[state.mic] || map.off;

  const dots = `<span style="display:flex;gap:7px;align-items:flex-end;height:14px">
    <span style="width:10px;height:10px;border-radius:999px;background:#DCB054;display:block;animation:sk-think 1.7s ease-in-out infinite"></span>
    <span style="width:10px;height:10px;border-radius:999px;background:#DCB054;display:block;animation:sk-think 1.7s ease-in-out 0.22s infinite"></span>
    <span style="width:10px;height:10px;border-radius:999px;background:#DCB054;display:block;animation:sk-think 1.7s ease-in-out 0.44s infinite"></span>
  </span>`;
  const bars = `<span style="display:flex;gap:5px;align-items:center;height:22px">
    <span style="width:6px;height:22px;border-radius:999px;background:#DCB054;display:block;animation:sk-speak 1.7s ease-in-out infinite"></span>
    <span style="width:6px;height:22px;border-radius:999px;background:#DCB054;display:block;animation:sk-speak 1.7s ease-in-out 0.28s infinite"></span>
    <span style="width:6px;height:22px;border-radius:999px;background:#DCB054;display:block;animation:sk-speak 1.7s ease-in-out 0.56s infinite"></span>
  </span>`;

  const asks = t.asks.map((q, i) => `
    <button type="button" class="sk-btn-pale sk-f" data-act="ask" data-arg="${i}" style="font-family:${F()};text-align:start;font-size:18px;font-weight:600;color:#1F4A36;background:#FDF8EF;border:2px solid #1F4A36;border-radius:999px;min-height:56px;padding:0 20px;cursor:pointer">${esc(q)}</button>`).join('');

  const turns = state.turns.map((x) => {
    const line = x.who === 'she' ? GREEN : BROWN;
    const anim = x.fresh ? 'animation:sk-row 260ms ease-out both;' : '';
    return `
    <div style="display:flex;flex-direction:column;gap:5px;border-inline-start:4px solid ${line};padding-inline-start:14px;${anim}">
      <span style="font-size:16px;font-weight:700;color:${line}">${esc(x.who === 'she' ? t.she : t.he)} · ${esc(num(x.at))}</span>
      <span style="font-size:19px;line-height:${t.lh};color:#2C2318">${esc(x.text)}</span>
    </div>`;
  }).join('');

  return `
  <div style="display:flex;flex-direction:column;gap:18px">
    <div style="background:${banner.bg};border:2px solid ${banner.line};border-radius:24px;padding:16px 18px;display:flex;flex-direction:column;gap:4px">
      <span style="font-size:16px;font-weight:700;letter-spacing:${t.track};text-transform:${t.caps};color:${banner.kick}">${esc(banner.k)}</span>
      <span style="font-size:20px;font-weight:700;line-height:1.35;color:#2C2318">${esc(banner.ti)}</span>
    </div>

    <div style="background:#FDF8EF;border:2px solid #6B4A2E;border-radius:24px;padding:24px 20px;display:flex;flex-direction:column;gap:16px;align-items:center">
      <button type="button" class="sk-f" data-act="mic" style="border:none;background:none;padding:0;cursor:pointer;border-radius:999px">
        <span style="width:150px;height:150px;border-radius:999px;background:${m.bg};border:3px solid ${m.line};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;animation:${m.anim}">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="${m.icon}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><path d="M12 19v3"></path></svg>
          ${state.mic === 'thinking' ? dots : ''}${state.mic === 'speaking' ? bars : ''}
        </span>
      </button>
      <span style="font-size:21px;font-weight:700;line-height:1.35;text-align:center;color:#143527">${esc(m.label)}</span>
      <span style="font-size:17px;color:#4A3220;text-align:center;line-height:1.5">${esc(m.hint)}</span>
    </div>

    <div style="display:flex;flex-direction:column;gap:10px">
      <span style="font-size:16px;font-weight:700;letter-spacing:${t.track};text-transform:${t.caps};color:#4A3220">${esc(t.askLabel)}</span>
      ${asks}
    </div>

    <div style="display:flex;flex-direction:column;gap:12px">
      <span style="font-size:16px;font-weight:700;letter-spacing:${t.track};text-transform:${t.caps};color:#4A3220">${esc(t.convoLabel)}</span>
      ${state.turns.length ? turns : `<span style="font-size:18px;line-height:1.55;color:#4A3220">${esc(t.convoEmpty)}</span>`}
    </div>

    <button type="button" class="sk-btn-amber sk-f" data-act="simulate" style="font-family:${F()};font-size:18px;font-weight:600;color:#8A5A10;background:#FAEDCF;border:2px dashed #8A5A10;border-radius:999px;min-height:56px;cursor:pointer">${esc(t.simulateCta)}</button>
    ${FILM_MODE ? '' : `
    <div style="display:flex;flex-direction:column;gap:10px">
      <span style="font-size:16px;font-weight:700;letter-spacing:${t.track};text-transform:${t.caps};color:#4A3220">${esc(t.triggers)}</span>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        ${[['medication', t.trigMed], ['drift', t.trigDrift], ['drift_resolved', t.trigBack], ['fall', t.trigFall]].map(([k, lbl]) => `
          <button type="button" class="sk-btn-amber sk-f" data-act="trigger" data-arg="${k}" style="font-family:${F()};font-size:16px;font-weight:600;color:#8A5A10;background:#FAEDCF;border:2px dashed #8A5A10;border-radius:20px;min-height:56px;padding:8px 12px;cursor:pointer;line-height:1.25">${esc(lbl)}</button>`).join('')}
      </div>
    </div>`}
  </div>`;
}

function medsPanel() {
  const t = L();
  const rows = doseList().map((d) => {
    const hot = d.due;
    return `
    <div style="background:${hot ? '#FAEDCF' : '#FDF8EF'};border:2px solid ${hot ? '#C79A3C' : BROWN};border-radius:24px;padding:18px 20px;display:flex;gap:14px;align-items:center">
      <span style="flex:none;font-size:22px;font-weight:700;color:${hot ? AMBER : '#143527'};font-variant-numeric:tabular-nums;min-width:68px">${esc(num(d.at))}</span>
      <span style="display:flex;flex-direction:column;gap:2px;flex:1;min-width:0">
        <span style="font-size:19px;font-weight:700;line-height:1.3;color:#2C2318">${esc(d.label)}</span>
        <span style="font-size:16px;color:#4A3220">${esc(d.state)}</span>
      </span>
      ${hot ? `<button type="button" class="sk-btn-green sk-f" data-act="take" data-arg="${esc(d.key)}" style="flex:none;font-family:${F()};font-size:17px;font-weight:600;color:#FDF8EF;background:#1F4A36;border:2px solid #1F4A36;border-radius:999px;min-height:52px;padding:0 18px;cursor:pointer">${esc(t.tookIt)}</button>`
      : d.done ? `<span style="flex:none;font-size:17px;font-weight:700;color:#1F4A36">${esc(t.taken)}</span>` : ''}
    </div>`;
  }).join('');

  const nd = nextDose();
  const sheLine = nd
    ? (isAr()
      ? `«${nd.label} في ${ar(nd.at)}.»`
      : `“${nd.label} at ${nd.at}.”`)
    : '';
  return `
  <div style="display:flex;flex-direction:column;gap:16px">
    <div style="display:flex;flex-direction:column;gap:4px">
      <span style="font-size:28px;font-weight:700;line-height:1.2;color:#143527">${esc(t.medsTitle)}</span>
      <span style="font-size:18px;color:#4A3220">${esc(t.medsBody)}</span>
    </div>
    ${rows}
    <div style="background:#FDF8EF;border:2px solid #6B4A2E;border-radius:24px;padding:18px 20px;display:flex;flex-direction:column;gap:6px">
      <span style="font-size:17px;font-weight:700;letter-spacing:${t.track};text-transform:${t.caps};color:#4A3220">${esc(t.medsSheLabel)}</span>
      <span style="font-size:19px;line-height:${t.lh};color:#143527">${esc(sheLine)}</span>
    </div>
  </div>`;
}

function safetyPanel() {
  const t = L(), p = state.pilgrim;
  const d = state.drift;
  const hot = d.active;
  const dist = Math.round(d.distance || 0);
  const note = hot ? t.outside(dist, d.bearing || (isAr() ? 'شمال شرق' : 'north-east')) : t.inside(dist, state.threshold);
  const ec = p.emergencyContact || {};
  const contact = `${isAr() ? ec.name : (ec.name_en || ec.name)} · <span dir="ltr" style="unicode-bidi:isolate">${esc(ec.phone || '')}</span>`;

  const log = state.log.map((l) => `
    <div style="display:flex;gap:12px;align-items:flex-start;animation:sk-row 260ms ease-out both">
      <span style="flex:none;font-size:16px;font-weight:700;color:#4A3220;font-variant-numeric:tabular-nums;min-width:48px">${esc(num(l.at))}</span>
      <span style="font-size:18px;line-height:1.5;min-width:0">${esc(l.text)}</span>
    </div>`).join('');

  return `
  <div style="display:flex;flex-direction:column;gap:16px">
    <div style="display:flex;flex-direction:column;gap:4px">
      <span style="font-size:28px;font-weight:700;line-height:1.2;color:#143527">${esc(t.safetyTitle)}</span>
      <span style="font-size:18px;color:#4A3220;line-height:1.5">${esc(t.safetyBody)}</span>
    </div>

    <div style="background:#FDF8EF;border:2px solid ${hot ? '#C79A3C' : BROWN};border-radius:24px;padding:20px;display:flex;flex-direction:column;gap:14px;align-items:center">
      <div style="position:relative;width:150px;height:150px;display:flex;align-items:center;justify-content:center">
        <span style="position:absolute;inset:0;border-radius:999px;border:2px dashed #A98A60"></span>
        <span style="position:absolute;inset:30px;border-radius:999px;border:2px solid #D9C8A7"></span>
        <span style="width:58px;height:58px;border-radius:999px;background:${hot ? AMBER : GREEN};display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:#FDF8EF">${esc(t.you)}</span>
        <span style="position:absolute;top:10px;inset-inline-end:16px;font-size:15px;font-weight:700;color:#4A3220;background:#F5ECDB;border:2px solid #6B4A2E;border-radius:999px;padding:3px 10px">${esc(t.group)}</span>
      </div>
      <span style="font-size:32px;font-weight:700;color:${hot ? AMBER : '#143527'};font-variant-numeric:tabular-nums">${esc(num(dist))}${isAr() ? ' م' : ' m'}</span>
      <span style="font-size:18px;color:#4A3220;text-align:center;line-height:1.5">${esc(note)}</span>
      ${FILM_MODE ? '' : `<button type="button" class="sk-btn-pale sk-f" data-act="drift" style="font-family:${F()};font-size:18px;font-weight:600;color:#1F4A36;background:#FDF8EF;border:2px solid #1F4A36;border-radius:999px;min-height:56px;padding:0 22px;cursor:pointer;width:100%">${esc(hot ? t.driftOff : t.driftOn)}</button>`}
    </div>

    <div style="background:#FDF8EF;border:2px solid #6B4A2E;border-radius:24px;padding:18px 20px;display:flex;flex-direction:column;gap:10px">
      <span style="font-size:17px;font-weight:700;letter-spacing:${t.track};text-transform:${t.caps};color:#4A3220">${esc(t.contactLabel)}</span>
      <span style="font-size:20px;font-weight:700;line-height:1.35;font-variant-numeric:tabular-nums">${contact}</span>
      <span style="font-size:17px;color:#4A3220;line-height:1.5">${esc(t.consentNote)}</span>
    </div>

    ${state.incident && !state.resolved ? `
    <div style="background:#FBE8E1;border:2px solid #9E2F1C;border-radius:24px;padding:18px 20px;display:flex;flex-direction:column;gap:12px">
      <span style="font-size:17px;font-weight:700;letter-spacing:${t.track};text-transform:${t.caps};color:#9E2F1C">${esc(t.logLabel)}</span>
      ${log}
      <button type="button" class="sk-btn-ok sk-f" data-act="resolve" style="font-family:${F()};font-size:18px;font-weight:600;color:#FDF8EF;background:#2C7A51;border:2px solid #2C7A51;border-radius:999px;min-height:56px;cursor:pointer">${esc(t.resolveCta)}</button>
    </div>` : ''}
  </div>`;
}

function sheet() {
  if (!state.asking) return '';
  const t = L();
  return `
  <div style="flex:none;background:#FAEDCF;border-top:3px solid #8A5A10;padding:20px 18px 26px;display:flex;flex-direction:column;gap:14px;animation:sk-sheet 320ms ease-out both;box-shadow:0 -18px 40px -22px rgba(44,35,24,0.6)">
    <span style="font-size:16px;font-weight:700;letter-spacing:${t.track};text-transform:${t.caps};color:#8A5A10">${esc(t.askingKicker)}</span>
    <span style="font-size:24px;font-weight:700;line-height:1.35;color:#2C2318">${esc(t.askingTitle)}</span>
    <span style="font-size:17px;color:#4A3220;line-height:1.5">${esc(t.askingNote)}</span>
    ${FILM_MODE ? '' : `<div style="display:flex;align-items:center;gap:12px;background:#FDF8EF;border:2px solid #8A5A10;border-radius:20px;padding:12px 16px">
      <span style="flex:none;width:44px;height:44px;border-radius:999px;background:${state.mic === 'listening' ? GREEN : '#F5ECDB'};border:2px solid ${state.mic === 'listening' ? GOLD : BROWN};display:flex;align-items:center;justify-content:center;${state.mic === 'listening' ? 'animation:sk-breathe 1.7s ease-in-out infinite' : ''}">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${state.mic === 'listening' ? '#FDF8EF' : GREEN}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><path d="M12 19v3"></path></svg>
      </span>
      ${state.mic === 'listening'
        ? `<span style="font-size:18px;line-height:1.4;color:#143527;font-weight:600">${esc(t.answerAloud)}</span>`
        : `<button type="button" class="sk-f" data-act="answer" style="flex:1;font-family:${F()};text-align:start;font-size:18px;font-weight:600;color:#1F4A36;background:none;border:none;padding:0;cursor:pointer;line-height:1.4">${esc(t.tapToAnswer)}</button>`}
    </div>`}

    <div style="display:flex;flex-direction:column;gap:10px">
      <button type="button" class="sk-btn-red sk-f-ink" data-act="yes" style="font-family:${F()};font-size:21px;font-weight:600;color:#FDF8EF;background:#9E2F1C;border:2px solid #9E2F1C;border-radius:999px;min-height:64px;cursor:pointer">${esc(t.yesCta)}</button>
      <button type="button" class="sk-btn-pale sk-f" data-act="no" style="font-family:${F()};font-size:21px;font-weight:600;color:#1F4A36;background:#FDF8EF;border:2px solid #1F4A36;border-radius:999px;min-height:64px;cursor:pointer">${esc(t.noCta)}</button>
    </div>
  </div>`;
}

function tabbar() {
  const t = L();
  const keys = ['home', 'voice', 'meds', 'safety'];
  const icons = ['home', 'mic', 'pill', 'shield'];
  return `
  <div style="flex:none;background:#FDF8EF;border-top:2px solid #6B4A2E;padding:10px 8px 30px;display:flex;gap:4px">
    ${keys.map((k, i) => {
      const on = state.tab === k;
      return `<button type="button" class="sk-f" data-act="tab" data-arg="${k}" style="flex:1;min-width:0;font-family:${F()};background:${on ? GREEN : '#FDF8EF'};border:2px solid ${on ? GREEN : '#D9C8A7'};border-radius:20px;padding:10px 4px;cursor:pointer;display:flex;flex-direction:column;gap:5px;align-items:center;min-height:64px">
        <span style="display:block;width:26px;height:26px;color:${on ? '#FDF8EF' : GREEN}">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${ICON[icons[i]]}"></path></svg>
        </span>
        <span style="font-size:15px;font-weight:600;line-height:1.2;color:${on ? '#FDF8EF' : GREEN};text-align:center">${esc(t.tabs[i])}</span>
      </button>`;
    }).join('')}
  </div>`;
}

function bannerBar() {
  if (!state.banner) return '';
  return `<div style="flex:none;background:#FBE8E1;border-bottom:2px solid #D8A291;padding:12px 18px;display:flex;gap:10px;align-items:center;justify-content:space-between">
    <span style="font-size:16px;line-height:1.45;color:#9E2F1C">${esc(state.banner)}</span>
    <button type="button" class="sk-f" data-act="replay" style="flex:none;font-family:${F()};font-size:15px;font-weight:700;color:#FDF8EF;background:#9E2F1C;border:none;border-radius:999px;min-height:40px;padding:0 14px;cursor:pointer">${esc(L().speak)}</button>
  </div>`;
}

let lastScroll = 0;
function render() {
  const t = L();
  const scroller = document.getElementById('sk-scroll');
  if (scroller) lastScroll = scroller.scrollTop;

  const panel = state.tab === 'pair' ? pairPanel()
    : state.tab === 'home' ? homePanel()
    : state.tab === 'voice' ? voicePanel()
    : state.tab === 'meds' ? medsPanel()
    : safetyPanel();

  app.innerHTML = `
    <div dir="${t.dir}" style="height:100%;display:flex;flex-direction:column;background:#F2E8D7;font-family:${F()};color:#2C2318">
      ${header()}
      ${bannerBar()}
      <div id="sk-scroll" style="flex:1;overflow:auto;padding:20px 18px 24px;display:flex;flex-direction:column;gap:18px">${panel}</div>
      ${sheet()}
      ${tabbar()}
    </div>`;

  const s2 = document.getElementById('sk-scroll');
  if (s2) s2.scrollTop = lastScroll;
  state.turns.forEach((x) => { x.fresh = false; });
  document.getElementById('sk-clock').textContent = num(makkahNow());
}

/* ------------------------------ events ------------------------------- */
app.addEventListener('click', (e) => {
  const b = e.target.closest('[data-act]');
  if (!b) return;
  const act = b.dataset.act, arg = b.dataset.arg;
  if (act === 'lang') setLang(arg);
  else if (act === 'tab') { state.tab = arg; state.banner = null; render(); }
  else if (act === 'scan') doScan();
  else if (act === 'connect') connectDevice(+arg);
  else if (act === 'start') startSession();
  else if (act === 'stop') stopSession();
  else if (act === 'mic') {
    if (!state.active) { state.banner = L().micOffHint; return render(); }
    if (state.mic === 'listening') { stopListening(); setMic('idle'); }
    else startListening();
  }
  else if (act === 'ask') sendText(L().asks[+arg]);
  else if (act === 'simulate') simulateDistress();
  else if (act === 'trigger') {
    if (!state.active) { state.banner = L().micOffHint; return render(); }
    stopListening();
    setMic('thinking');
    api('/api/demo/trigger', { pilgrimId: state.pilgrim.id, kind: arg })
      .catch(() => { state.banner = 'That trigger did not fire.'; setMic('listening'); });
  }
  else if (act === 'take') { state.taken[arg] = true; render(); }
  else if (act === 'drift') toggleDrift();
  else if (act === 'answer') startListening();
  else if (act === 'yes') sayYes();
  else if (act === 'no') sayNo();
  else if (act === 'resolve') resolveIncident();
  else if (act === 'replay') { state.banner = null; if (lastAudio) playB64(lastAudio).catch(() => {}); else render(); }
});

/* منفذ اختبار · a test hook: feeds text through the exact path a spoken
   sentence takes, so the voice flow can be verified without a microphone. */
window.__sk_say = (text) => sendText(text);
window.__sk_play = (b64) => playB64(b64);

/* ------------------------------ sockets ------------------------------ */
const socket = io();
const $ = (id) => document.getElementById(id);

socket.on('connect', () => { $('sk-conn').textContent = 'server: connected'; });
socket.on('disconnect', () => { $('sk-conn').textContent = 'server: disconnected'; });

socket.on('brain', (p) => {
  $('sk-brain').textContent = p.fallback
    ? 'brain: fallback' + (p.quota ? ' (Gemini quota exhausted)' : '')
    : 'brain: Gemini';
});

socket.on('proactive-speak', (p) => {
  if (!state.pilgrim || p.pilgrimId !== state.pilgrim.id) return;
  stopListening();
  handleReply(p);
});

socket.on('proactive-error', (p) => {
  state.banner = 'She could not speak: ' + p.error;
  setMic(state.active ? 'listening' : 'idle');
});

socket.on('location', (p) => {
  if (!state.pilgrim || p.pilgrimId !== state.pilgrim.id) return;
  state.drift = { active: !!p.drifting, distance: p.distance || 0, bearing: p.bearing || '' };
  state.threshold = p.thresholdM || state.threshold;
  $('sk-loc').textContent =
    `location: ${Math.round(p.distance || 0)} m ${p.drifting ? '· drifting' : '· with group'} (${p.source || 'sim'})`;
  if (state.tab === 'safety' || state.tab === 'home') render();
});

socket.on('alert', (a) => {
  // the server nests the pilgrim inside the alert · الحاج مُضمَّن داخل البلاغ
  const pid = a.pilgrimId || (a.pilgrim && a.pilgrim.id);
  if (!state.pilgrim || pid !== state.pilgrim.id) return;
  state.incident = true; state.resolved = false; state.asking = false;
  state.log = [{ at: makkahNow(), text: isAr() ? 'أكّد أنه يحتاج مساعدة — رُفع البلاغ' : 'He confirmed he needs help — alert raised' }];
  state.tab = 'safety';
  render();
});

socket.on('alert-log', (line) => {
  const text = typeof line === 'string' ? line
    : (isAr() ? line.text : (line.text_en || line.text)) || '';
  if (!text) return;
  state.log.push({ at: line.at || makkahNow(), text });
  if (state.tab === 'safety') render();
});

/* ------------------------------- boot -------------------------------- */
(async function boot() {
  if (FILM_MODE) { state.scan = 'found'; state.budIndex = 0; state.tab = 'voice'; }
  else if (!HAS_SR) state.banner = IS_IOS ? L().useSafari : L().noRecognition;
  const db = await fetch('/api/campaign').then((r) => r.json());
  state.campaign = db.campaign;
  state.pilgrim = db.pilgrims.find((p) => p.isDemoPilgrim) || db.pilgrims[0];
  render();
  setInterval(() => {
    document.getElementById('sk-clock').textContent = num(makkahNow());
    if (state.tab === 'meds' || state.tab === 'home') render();
  }, 30000);
})();
