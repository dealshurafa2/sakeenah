'use strict';
/**
 * حالة الجلسة + جدولة الأدوية التلقائية + محاكاة الموقع وكشف الابتعاد.
 *
 * ملاحظة صريحة: لا يوجد GPS حقيقي في النموذج الأولي. مصدر الإحداثيات محاكى،
 * أما منطق الكشف (حساب المسافة، عتبة الابتعاد، اتجاه العودة) فحقيقي ويعمل فعلاً
 * على أي مصدر إحداثيات، بما فيه GPS حقيقي لاحقاً.
 */

const EventEmitter = require('events');

const TZ = 'Asia/Riyadh'; // توقيت مكة المكرمة
const DRIFT_THRESHOLD_M = Number(process.env.DRIFT_THRESHOLD_M || 80);
const REJOIN_THRESHOLD_M = Number(process.env.REJOIN_THRESHOLD_M || 35);
const DRIFT_AFTER_SECONDS = Number(process.env.DRIFT_AFTER_SECONDS || 150);
const DEMO_MED_AFTER_SECONDS = Number(process.env.DEMO_MED_AFTER_SECONDS || 120);

// موقع المجموعة: صحن المطاف، المسجد الحرام
const GROUP_ORIGIN = { lat: 21.42251, lng: 39.82616 };

const bus = new EventEmitter();
const sessions = new Map();

function nowInMakkah() {
  return new Intl.DateTimeFormat('ar-SA-u-nu-latn', {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(new Date());
}

function clockHHMM() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(new Date());
  return parts;
}

function todayKey() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date());
}

function haversine(a, b) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const la1 = toRad(a.lat);
  const la2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function bearingAr(from, to) {
  const toRad = (d) => (d * Math.PI) / 180;
  const y = Math.sin(toRad(to.lng - from.lng)) * Math.cos(toRad(to.lat));
  const x =
    Math.cos(toRad(from.lat)) * Math.sin(toRad(to.lat)) -
    Math.sin(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.cos(toRad(to.lng - from.lng));
  let deg = (Math.atan2(y, x) * 180) / Math.PI;
  deg = (deg + 360) % 360;
  const dirs = [
    'الشمال',
    'الشمال الشرقي',
    'الشرق',
    'الجنوب الشرقي',
    'الجنوب',
    'الجنوب الغربي',
    'الغرب',
    'الشمال الغربي'
  ];
  return dirs[Math.round(deg / 45) % 8];
}

function bearingEn(from, to) {
  const toRad = (d) => (d * Math.PI) / 180;
  const y = Math.sin(toRad(to.lng - from.lng)) * Math.cos(toRad(to.lat));
  const x =
    Math.cos(toRad(from.lat)) * Math.sin(toRad(to.lat)) -
    Math.sin(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.cos(toRad(to.lng - from.lng));
  let deg = (Math.atan2(y, x) * 180) / Math.PI;
  deg = (deg + 360) % 360;
  const dirs = ['north', 'north-east', 'east', 'south-east', 'south', 'south-west', 'west', 'north-west'];
  return dirs[Math.round(deg / 45) % 8];
}

function getSession(pilgrim) {
  let s = sessions.get(pilgrim.id);
  if (!s) {
    s = {
      pilgrimId: pilgrim.id,
      step: 0,
      history: [],
      awaitingConfirm: false,
      emergencyOpen: false,
      startedAt: Date.now(),
      firedMeds: new Set(),
      active: false,
      drift: { active: false, distance: 0, direction: '', announced: false },
      location: { ...GROUP_ORIGIN },
      group: { ...GROUP_ORIGIN },
      simMode: 'with_group', // with_group | drifting | returning
      locationSource: 'sim',  // 'sim' = demo persona · 'real' = this device's GPS
      groupAnchored: false,
      autoDriftDone: false,
      accuracy: null,
      thresholdM: DRIFT_THRESHOLD_M,
      lang: 'en'
    };
    sessions.set(pilgrim.id, s);
  }
  return s;
}

function resetSession(pilgrimId) {
  sessions.delete(pilgrimId);
}

function setActive(pilgrim, active, lang) {
  const s = getSession(pilgrim);
  s.active = active;
  if (lang) s.lang = lang === 'en' ? 'en' : 'ar';
  if (active) s.startedAt = Date.now();
  return s;
}

const T = (p, field, lang) => (lang === 'en' && p[field + '_en'] ? p[field + '_en'] : p[field]);

function setSimMode(pilgrim, mode) {
  const s = getSession(pilgrim);
  s.simMode = mode;
  if (mode === 'drifting') s.autoDriftDone = true;
  if (mode === 'with_group') {
    s.location = { ...s.group };
    s.drift = { active: false, distance: 0, direction: '', announced: false };
  }
  return s;
}

/** تقييم الابتعاد — يعمل على أي مصدر إحداثيات: محاكى أو GPS حقيقي.
 *  Drift evaluation — runs on ANY coordinate source: simulated or real GPS. */
function evaluateDrift(pilgrim, s) {
  const dist = haversine(s.location, s.group);
  const rejoin = Math.max(8, s.thresholdM * 0.45);
  s.drift.distance = Math.round(dist);
  s.drift.direction = bearingAr(s.location, s.group);
  s.drift.directionEn = bearingEn(s.location, s.group);

  if (!s.drift.active && dist > s.thresholdM) {
    s.drift.active = true;
    bus.emit('proactive', {
      pilgrimId: pilgrim.id,
      kind: 'drift',
      event:
        s.lang === 'en'
          ? `The pilgrim has drifted ${s.drift.distance} metres from his group. The correct direction back is ${s.drift.directionEn}. Guide him back gently and calmly, without worrying him.`
          : `ابتعد الحاج عن مجموعته مسافة ${s.drift.distance} متراً. اتجاه العودة الصحيح نحو ${s.drift.direction}. أرشديه بلطف وهدوء دون أن تُقلقيه.`
    });
    if (s.locationSource === 'sim') s.simMode = 'returning';
  } else if (s.drift.active && dist < rejoin) {
    s.drift.active = false;
    if (s.locationSource === 'sim') s.simMode = 'with_group';
    bus.emit('proactive', {
      pilgrimId: pilgrim.id,
      kind: 'drift_resolved',
      event:
        s.lang === 'en'
          ? 'The pilgrim has rejoined his group. Reassure him in one very short sentence, then continue guiding him through the current Tawaf step.'
          : 'عاد الحاج إلى مجموعته بنجاح. طمئنيه بجملة قصيرة جداً ثم أكملي إرشاده في خطوة الطواف الحالية.'
    });
  }
  return s;
}

/** إحداثيات حقيقية من متصفح الحاج · a real GPS fix from the pilgrim's browser */
function setRealLocation(pilgrim, lat, lng, accuracy) {
  const s = getSession(pilgrim);
  s.locationSource = 'real';
  s.location = { lat, lng };
  s.accuracy = accuracy == null ? null : Math.round(accuracy);
  if (!s.groupAnchored) {
    s.group = { lat, lng };
    s.groupAnchored = true;
  }
  return evaluateDrift(pilgrim, s);
}

/** يثبّت موقع المجموعة عند الموقع الحالي · anchor the group at the current position */
function anchorGroupHere(pilgrim) {
  const s = getSession(pilgrim);
  s.group = { ...s.location };
  s.groupAnchored = true;
  s.drift.active = false;
  return evaluateDrift(pilgrim, s);
}

function setLocationMode(pilgrim, source, thresholdM) {
  const s = getSession(pilgrim);
  s.locationSource = source === 'real' ? 'real' : 'sim';
  if (thresholdM) s.thresholdM = Math.max(5, Math.min(1000, Number(thresholdM)));
  if (s.locationSource === 'sim') {
    s.groupAnchored = false;
    s.accuracy = null;
    s.group = { ...GROUP_ORIGIN };
    s.location = { ...GROUP_ORIGIN };
    s.simMode = 'with_group';
    s.drift = { active: false, distance: 0, direction: '', directionEn: '', announced: false };
  }
  return s;
}

/** خطوة محاكاة الموقع — تُستدعى كل ثانيتين (وضع العرض فقط) */
function tickLocation(pilgrim) {
  const s = getSession(pilgrim);
  if (!s.active) return s;

  // في الوضع الحقيقي لا نحرّك شيئاً — المتصفح هو مصدر الإحداثيات
  if (s.locationSource === 'real') return s;

  const elapsed = (Date.now() - s.startedAt) / 1000;
  // يُطلق مرة واحدة فقط لكل جلسة — وإلا لدخلنا في حلقة ابتعاد/عودة لا تنتهي
  // Fires ONCE per session — otherwise it loops drift/rejoin forever and burns API quota.
  if (
    !s.autoDriftDone &&
    s.simMode === 'with_group' &&
    DRIFT_AFTER_SECONDS > 0 &&
    elapsed > DRIFT_AFTER_SECONDS
  ) {
    s.simMode = 'drifting';
    s.autoDriftDone = true;
  }

  const M_PER_DEG_LAT = 111320;
  const M_PER_DEG_LNG = 111320 * Math.cos((GROUP_ORIGIN.lat * Math.PI) / 180);

  if (s.simMode === 'drifting') {
    s.location.lat -= (5.0 * 0.6) / M_PER_DEG_LAT;
    s.location.lng -= (5.0 * 0.8) / M_PER_DEG_LNG;
  } else if (s.simMode === 'returning') {
    const d = haversine(s.location, s.group);
    if (d > 3) {
      const f = Math.min(1, 3.5 / d);
      s.location.lat += (s.group.lat - s.location.lat) * f;
      s.location.lng += (s.group.lng - s.location.lng) * f;
    }
  } else {
    s.location.lat = s.group.lat + (Math.random() - 0.5) * 0.00008;
    s.location.lng = s.group.lng + (Math.random() - 0.5) * 0.00008;
  }

  return evaluateDrift(pilgrim, s);
}

/** فحص مواعيد الأدوية — يُستدعى كل ١٠ ثوانٍ */
function tickMedications(pilgrim) {
  const s = getSession(pilgrim);
  if (!s.active) return;
  if (!pilgrim.medications || !pilgrim.medications.length) return;

  const hhmm = clockHHMM();
  const day = todayKey();

  for (const med of pilgrim.medications) {
    for (const t of med.times) {
      const key = `${day}:${med.name}:${t}`;
      if (s.firedMeds.has(key)) continue;
      if (t === hhmm) {
        s.firedMeds.add(key);
        bus.emit('proactive', {
          pilgrimId: pilgrim.id,
          kind: 'medication',
          med,
          event:
            s.lang === 'en'
              ? `It is now time for the pilgrim's medication: ${T(med, 'name', 'en')}, ${T(med, 'dose', 'en')}${
                  T(med, 'note', 'en') ? ` (${T(med, 'note', 'en')})` : ''
                }, due at ${t}. Remind him of that specific medicine and dose by name, in one short warm sentence.`
              : `حان الآن موعد دواء الحاج: ${med.name} بجرعة ${med.dose}${
                  med.note ? ` (${med.note})` : ''
                } في تمام الساعة ${t}. ذكّريه باسم الدواء والجرعة تحديداً بجملة قصيرة ودافئة.`
        });
      }
    }
  }

  // جرعة عرض توضيحي: تُطلق مرة واحدة بعد بدء الجلسة حتى يراها المحكّمون
  if (DEMO_MED_AFTER_SECONDS > 0 && pilgrim.isDemoPilgrim) {
    const elapsed = (Date.now() - s.startedAt) / 1000;
    const key = `demo:${s.startedAt}`;
    if (elapsed > DEMO_MED_AFTER_SECONDS && !s.firedMeds.has(key)) {
      s.firedMeds.add(key);
      const med = pilgrim.medications[0];
      bus.emit('proactive', {
        pilgrimId: pilgrim.id,
        kind: 'medication',
        med,
        event:
          s.lang === 'en'
            ? `It is now time for the pilgrim's medication: ${T(med, 'name', 'en')}, ${T(med, 'dose', 'en')}${
                T(med, 'note', 'en') ? ` (${T(med, 'note', 'en')})` : ''
              }. Remind him of that specific medicine and dose by name, in one short warm sentence.`
            : `حان الآن موعد دواء الحاج: ${med.name} بجرعة ${med.dose}${
                med.note ? ` (${med.note})` : ''
              }. ذكّريه باسم الدواء والجرعة تحديداً بجملة قصيرة ودافئة.`
      });
    }
  }
}

module.exports = {
  bus,
  getSession,
  resetSession,
  setActive,
  setSimMode,
  setRealLocation,
  anchorGroupHere,
  setLocationMode,
  evaluateDrift,
  tickLocation,
  tickMedications,
  nowInMakkah,
  haversine,
  GROUP_ORIGIN,
  DRIFT_THRESHOLD_M,
  DRIFT_AFTER_SECONDS,
  DEMO_MED_AFTER_SECONDS
};
