'use strict';
/**
 * الردود الفورية · Instant replies.
 *
 * Every line here is one Sakeenah could have generated, written once by hand
 * so it costs no Gemini request and no waiting. It covers exactly the moments
 * that must never be slow or fail on stage:
 *
 *   · the four proactive events (medication, drift, rejoin, fall)
 *   · the three questions the app offers as taps
 *   · yes / no to "Do you need help?"
 *
 * Anything the pilgrim says freely still goes to Gemini — that is where the
 * real conversation lives. These are the scripted beats, and they are instant.
 */

const RITUALS = require('./rituals');

const pad = (n) => String(n).padStart(2, '0');

function makkahMinutes() {
  const s = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Riyadh', hour: '2-digit', minute: '2-digit', hour12: false
  }).format(new Date());
  const [h, m] = s.split(':').map(Number);
  return h * 60 + m;
}
const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };

/** كل الجرعات مرتبة مع حالتها · every dose, in order, with how far off it is */
function schedule(pilgrim, lang) {
  const now = makkahMinutes();
  const out = [];
  for (const med of pilgrim.medications || []) {
    for (const at of med.times || []) {
      out.push({
        at,
        mins: toMin(at),
        delta: now - toMin(at),
        name: lang === 'en' ? (med.name_en || med.name) : med.name,
        dose: lang === 'en' ? (med.dose_en || med.dose) : med.dose,
        note: lang === 'en' ? (med.note_en || med.note) : med.note
      });
    }
  }
  return out.sort((a, b) => a.mins - b.mins);
}

function dueNow(pilgrim, lang) {
  return schedule(pilgrim, lang).find((d) => d.delta >= -10 && d.delta <= 60) || null;
}
function upcoming(pilgrim, lang) {
  const list = schedule(pilgrim, lang);
  const now = makkahMinutes();
  return list.find((d) => d.mins > now) || list[0] || null;
}

const hoursPhrase = (mins, lang) => {
  const h = Math.floor(mins / 60), m = mins % 60;
  if (lang === 'en') {
    if (h === 0) return `${m} minutes`;
    if (m === 0) return h === 1 ? 'an hour' : `${h} hours`;
    return `${h} ${h === 1 ? 'hour' : 'hours'} and ${m} minutes`;
  }
  if (h === 0) return `${m} دقيقة`;
  if (m === 0) return h === 1 ? 'ساعة' : `${h} ساعات`;
  return `${h} ساعات و${m} دقيقة`;
};

/* ------------------------ الأحداث الاستباقية · proactive ------------------ */

function medication(pilgrim, lang) {
  const d = dueNow(pilgrim, lang) || upcoming(pilgrim, lang);
  if (!d) return null;
  const note = d.note ? (lang === 'en' ? `, ${d.note}` : `، ${d.note}`) : '';
  return lang === 'en'
    ? { reply: `Hajj Mohammad, it's time for your ${d.name}, ${d.dose}${note}. Take it whenever you're ready.`, action: 'medication_reminder' }
    : { reply: `يا حاج محمد، حان وقت ${d.name} بجرعة ${d.dose}${note}. خذه متى ما تيسّر لك.`, action: 'medication_reminder' };
}

function drift(pilgrim, lang, dist, dir) {
  const d = Math.round(dist || 0);
  const where = lang === 'en' ? (dir || 'behind you') : (dir || 'خلفك');
  return lang === 'en'
    ? { reply: `Hajj, your group has moved a little ahead — about ${d} metres. Turn gently towards ${where} and walk slowly; I'm with you the whole way.`, action: 'lost_guidance' }
    : { reply: `يا حاج، تقدّمت مجموعتك عنك قليلاً، حوالي ${d} متراً. التفت برفق نحو ${where} وامشِ على مهلك، وأنا معك في الطريق كله.`, action: 'lost_guidance' };
}

function rejoined(pilgrim, lang) {
  return lang === 'en'
    ? { reply: `You're back with your group, Hajj. Nothing to worry about — let's carry on.`, action: 'none' }
    : { reply: `رجعت إلى مجموعتك يا حاج. لا شيء يدعو للقلق، نكمل بإذن الله.`, action: 'none' };
}

function fall(pilgrim, lang) {
  return lang === 'en'
    ? { reply: `Hajj Mohammad, I felt you go down. Stay where you are and breathe with me. Do you need help?`, action: 'ask_confirm_distress' }
    : { reply: `يا حاج محمد، أحسست أنك وقعت. ابقَ مكانك وتنفّس معي. هل تحتاج مساعدة؟`, action: 'ask_confirm_distress' };
}

/* نسخ قصيرة للفيديو · film-length versions of the same lines. Same voice, same
   meaning, fewer words — a sixty-second film cannot hold the full ones. */
const BRIEF = {
  ritual: {
    en: 'Keep the Kaaba on your left, Hajj. This is your first circuit — I will count them with you.',
    ar: 'اجعل الكعبة عن يسارك يا حاج. هذا شوطك الأول، وسأعدّها معك.'
  },
  medication: {
    en: (d) => `Hajj Mohammad, it is time for your ${d.name}, ${d.dose}. Take it whenever you are ready.`,
    ar: (d) => `يا حاج محمد، حان وقت ${d.name} بجرعة ${d.dose}. خذه متى ما تيسّر لك.`
  },
  drift: {
    en: (m) => `Hajj, your group is about ${m} metres ahead. Turn gently to your right and walk slowly — I am with you.`,
    ar: (m) => `يا حاج، مجموعتك على بُعد ${m} متراً أمامك. التفت يميناً برفق وامشِ على مهلك، أنا معك.`
  },
  drift_resolved: {
    en: 'You are back with your group, Hajj. Nothing to worry about.',
    ar: 'رجعت إلى مجموعتك يا حاج. لا شيء يدعو للقلق.'
  },
  fall: {
    en: 'Take it easy, Hajj. Breathe slowly with me. Do you need help?',
    ar: 'على مهلك يا حاج. تنفّس ببطء معي. هل تحتاج مساعدة؟'
  },
  confirmed: {
    en: 'I have told your son Ahmad and your campaign leader. Stay where you are — someone is coming now.',
    ar: 'أبلغت ابنك أحمد ورئيس حملتك. ابقَ مكانك، أحدهم في طريقه إليك الآن.'
  }
};

function ritual(pilgrim, lang, step) {
  const steps = RITUALS.TAWAF_STEPS || RITUALS.steps || RITUALS;
  const list = Array.isArray(steps) ? steps : [];
  if (!list.length) return null;
  const i = Math.max(0, Math.min(list.length - 1, Number(step) || 0));
  const st = list[i];
  const text = lang === 'en' ? (st.guidance_en || st.guidance) : st.guidance;
  return { reply: text, action: 'none', step: i };
}

function proactive(kind, pilgrim, lang, ctx = {}) {
  if (ctx.brief) {
    const l = lang === 'en' ? 'en' : 'ar';
    if (kind === 'ritual') return { reply: BRIEF.ritual[l], action: 'none' };
    if (kind === 'medication') {
      const d = dueNow(pilgrim, l) || upcoming(pilgrim, l);
      if (d) return { reply: BRIEF.medication[l](d), action: 'medication_reminder' };
    }
    if (kind === 'drift') return { reply: BRIEF.drift[l](Math.round(ctx.distance || 0)), action: 'lost_guidance' };
    if (kind === 'drift_resolved') return { reply: BRIEF.drift_resolved[l], action: 'none' };
    if (kind === 'fall') return { reply: BRIEF.fall[l], action: 'ask_confirm_distress' };
  }
  if (kind === 'ritual') return ritual(pilgrim, lang, ctx.step);
  if (kind === 'medication') return medication(pilgrim, lang);
  if (kind === 'drift') return drift(pilgrim, lang, ctx.distance, ctx.direction);
  if (kind === 'drift_resolved') return rejoined(pilgrim, lang);
  if (kind === 'fall') return fall(pilgrim, lang);
  return null;
}

/* ---------------------- الأسئلة الثلاثة · the tap questions --------------- */

function aboutMedicine(pilgrim, lang) {
  const due = dueNow(pilgrim, lang);
  if (due) {
    return lang === 'en'
      ? { reply: `Yes, Hajj — your ${due.name}, ${due.dose}, is due now. Take it whenever you're ready.`, action: 'none' }
      : { reply: `نعم يا حاج، ${due.name} بجرعة ${due.dose} مستحق الآن. خذه متى ما تيسّر لك.`, action: 'none' };
  }
  const next = upcoming(pilgrim, lang);
  if (!next) {
    return lang === 'en'
      ? { reply: `You have no medicines on your schedule, Hajj.`, action: 'none' }
      : { reply: `لا يوجد دواء في جدولك يا حاج.`, action: 'none' };
  }
  let gap = next.mins - makkahMinutes();
  if (gap < 0) gap += 24 * 60;
  return lang === 'en'
    ? { reply: `Not yet, Hajj. Your ${next.name} is at ${next.at}, about ${hoursPhrase(gap, 'en')} from now.`, action: 'none' }
    : { reply: `ليس بعد يا حاج. ${next.name} في الساعة ${next.at}، بعد ${hoursPhrase(gap, 'ar')} من الآن.`, action: 'none' };
}

function aboutCircuits(pilgrim, lang, step) {
  const done = Math.max(0, Math.min(7, step || 1));
  const left = Math.max(0, 7 - done);
  if (left === 0) {
    return lang === 'en'
      ? { reply: `You've completed all seven circuits, Hajj. Take your time and rest now.`, action: 'none' }
      : { reply: `أتممت الأشواط السبعة يا حاج. خذ راحتك الآن.`, action: 'none' };
  }
  return lang === 'en'
    ? { reply: `You're on your ${['first','second','third','fourth','fifth','sixth','seventh'][done - 1] || 'first'} circuit. ${left} more, and you may rest whenever you wish.`, action: 'none' }
    : { reply: `أنت في الشوط ${['الأول','الثاني','الثالث','الرابع','الخامس','السادس','السابع'][done - 1] || 'الأول'}. بقي ${left}، ويمكنك أن ترتاح متى شئت.`, action: 'none' };
}

function aboutGroup(pilgrim, lang, driftState) {
  const d = Math.round((driftState && driftState.distance) || 0);
  const far = driftState && driftState.active;
  const dir = lang === 'en'
    ? (driftState && driftState.directionEn) || 'ahead of you'
    : (driftState && driftState.direction) || 'أمامك';
  if (far) {
    return lang === 'en'
      ? { reply: `They're about ${d} metres away, ${dir}. Walk slowly that way and I'll tell you when you're back.`, action: 'lost_guidance' }
      : { reply: `هم على بُعد ${d} متراً تقريباً، ${dir}. امشِ على مهلك في ذلك الاتجاه وسأخبرك عندما تصل.`, action: 'lost_guidance' };
  }
  return lang === 'en'
    ? { reply: `They're ${d} metres from you, ${dir}. You're perfectly fine, Hajj.`, action: 'none' }
    : { reply: `هم على بُعد ${d} متراً منك، ${dir}. أنت بخير تماماً يا حاج.`, action: 'none' };
}

/* --------------------- نعم / لا بعد السؤال · yes / no -------------------- */

/* هذه تُطابَق فقط بعد أن تسأل · these are matched only after she has asked,
   so a bare "help" is unambiguous here in a way it would never be otherwise. */
const YES = [
  /\byes\b/i, /\byeah\b/i, /\byep\b/i, /\byes+\b/i, /\bsure\b/i,
  /please help/i, /\bhelp me\b/i, /i need help/i, /i need someone/i, /send someone/i,
  /^\s*help[\s.!,]*$/i, /call (someone|my son|for help)/i, /\bplease\b.*\bcome\b/i,
  /نعم/, /ايوه/, /أيوه/, /أجل/, /اي\b/, /ساعدني/, /ساعديني/, /أحتاج مساعدة/, /احتاج مساعدة/,
  /أبغى مساعدة/, /ابغى مساعدة/, /تعال/, /اتصلي/, /^\s*مساعدة\s*$/, /بليز/
];
const NO = [
  /\bno\b/i, /\bnope\b/i, /i'?m (alright|all right|ok|okay|fine|good)/i,
  /i am (alright|all right|ok|okay|fine|good)/i, /no,? thank/i, /don'?t call/i, /not necessary/i,
  /^\s*لا\s*[.!،]?\s*$/, /^\s*لا[\s،.!]/, /\sلا\s*[،.!]/, /أنا بخير/, /انا بخير/, /الحمد لله/, /ما أحتاج/, /ما احتاج/,
  /لا شكرا/, /لا شكراً/, /ما في داعي/, /مافي داعي/, /لا تتصلي/
];
const match = (list, text) => list.some((re) => re.test(text));

function confirmation(text, lang, brief) {
  const t = String(text || '').trim();
  if (!t) return null;
  if (match(YES, t)) {
    if (brief) return { reply: BRIEF.confirmed[lang === 'en' ? 'en' : 'ar'], action: 'confirmed_emergency' };
    return lang === 'en'
      ? { reply: `I've told your son Ahmad and your campaign leader. Stay exactly where you are — someone is coming to you now.`, action: 'confirmed_emergency' }
      : { reply: `أبلغت ابنك أحمد ورئيس حملتك. ابقَ مكانك تماماً، أحدهم في طريقه إليك الآن.`, action: 'confirmed_emergency' };
  }
  if (match(NO, t)) {
    return lang === 'en'
      ? { reply: `Alright, Hajj. I won't call anyone. Let's rest here a moment and walk again when you're ready.`, action: 'none' }
      : { reply: `طيب يا حاج، لن أتصل بأحد. نرتاح هنا قليلاً ونكمل متى ما كنت جاهزاً.`, action: 'none' };
  }
  return null;
}

/* ------------- إجابة فورية لسؤال معروف · an instant tap answer ------------ */

const Q_MED = [/time for my medicine/i, /my medication/i, /حان وقت دوائي/, /وقت الدواء/];
const Q_CIRC = [/circuits are left/i, /how many circuits/i, /كم شوطاً بقي/, /كم شوط/];
const Q_GROUP = [/how far am i/i, /from my group/i, /كم أبعد عن مجموعتي/, /عن مجموعتي/];

function answer(text, { pilgrim, lang, step, drift, awaitingConfirm, brief }) {
  const t = String(text || '').trim();
  if (!t) return null;
  if (awaitingConfirm) {
    const c = confirmation(t, lang, brief);
    if (c) return c;
  }
  if (match(Q_MED, t)) return aboutMedicine(pilgrim, lang);
  if (match(Q_CIRC, t)) return aboutCircuits(pilgrim, lang, step);
  if (match(Q_GROUP, t)) return aboutGroup(pilgrim, lang, drift);
  return null;
}

/** كل السطور الثابتة، لتسخين الصوت مسبقاً · every fixed line, for pre-warming */
function warmupLines(pilgrim) {
  const out = [];
  for (const lang of ['en', 'ar']) {
    for (let st = 0; st < 4; st++) {
      const r = ritual(pilgrim, lang, st);
      if (r) out.push({ lang, text: r.reply });
    }
    for (const kind of ['medication', 'drift', 'drift_resolved', 'fall']) {
      const r = proactive(kind, pilgrim, lang, { distance: 62 });
      if (r) out.push({ lang, text: r.reply });
    }
    for (const r of [aboutMedicine(pilgrim, lang), aboutCircuits(pilgrim, lang, 1), aboutGroup(pilgrim, lang, { distance: 0 })]) {
      if (r) out.push({ lang, text: r.reply });
    }
    for (const kind of ['ritual', 'medication', 'drift', 'drift_resolved', 'fall']) {
      const r = proactive(kind, pilgrim, lang, { distance: 62, brief: true });
      if (r) out.push({ lang, text: r.reply });
    }
    {
      const c = confirmation('yes', lang, true);
      if (c) out.push({ lang, text: c.reply });
    }
    for (const t of ['yes', 'no']) {
      const c = confirmation(t, lang);
      if (c) out.push({ lang, text: c.reply });
    }
  }
  return out;
}

module.exports = { proactive, answer, confirmation, warmupLines, dueNow, upcoming, schedule, ritual };
