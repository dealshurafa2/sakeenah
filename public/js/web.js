'use strict';
/* Sakeenah — the campaign board (roster + live alerts).
   Markup and inline styles are the Claude Design export, unchanged.
   Every number below comes from the running server: the real roster, the real
   medication schedule against the real Makkah clock, live distance from the
   drift engine, and real alerts raised only after a pilgrim has confirmed. */

const GREEN = '#1F4A36', BROWN = '#6B4A2E', AMBER = '#8A5A10', RED = '#9E2F1C', OK = '#2C7A51';

const EN = {
  dir: 'ltr', font: 'Inter, sans-serif', track: '0.08em', caps: 'uppercase',
  brand: 'Sakeenah', roster: 'Roster', alerts: 'Alerts', makkah: 'Makkah',
  raiseCta: 'Raise a test alert', raiseAnother: 'Raise another test alert',
  search: 'Search name, earpiece or group…', clear: 'Clear',
  filters: [['all', 'Everyone'], ['well', 'In group · well'], ['drift', 'Walking back'], ['due', 'Dose due'], ['alert', 'In alert']],
  noMatchTitle: 'No pilgrim matches that',
  noMatchBody: 'Try a name, an earpiece number like SK-1042, or a group letter — or clear the search to see all of them.',
  conditions: 'Conditions', nextDose: 'Next dose', fromGroup: 'From group',
  statusWell: 'In group · well', statusDrift: 'Walking back to group',
  statusDue: 'Dose due now', statusAlert: 'Emergency confirmed',
  record: 'Pilgrim record', close: 'Close', schedule: 'Medication schedule',
  contact: 'Emergency contact', session: 'Session',
  raiseSel: 'Simulate his confirmed alert', openAlert: 'Open his alert',
  heardYes: 'He said yes — help dispatched', heardNo: 'Consent is always asked for first',
  board: 'Board', live: 'Live', archive: 'Archive',
  allWell: 'All pilgrims are well',
  allWellBody: 'This board stays empty until a pilgrim is asked whether he needs help — and says yes.',
  simulateIncoming: 'Simulate an incoming alert',
  headline: 'Emergency confirmed',
  whatSheHeard: 'What she heard, and what she said',
  heSaid: 'He said', sheSaid: 'She said', heAnswered: 'He answered',
  yesPlease: 'Yes. Please help me.',
  medication: 'Medication', earpiece: 'Earpiece', lastPosition: 'Last position',
  notifLog: 'Notification log', sent: 'sent', ofSent: 'of 5 sent',
  ack: 'Acknowledge · send a supervisor', acked: 'Acknowledged',
  closeIncident: 'Close the incident',
  smsNote: 'SMS is shown as a log line in this prototype, not sent. Everything between detection and alert is real.',
  archiveNote: "Every incident keeps what she heard, what she asked, and how long help took — the campaign's record of duty of care.",
  resolvedIn: 'Resolved in', reachedInTime: 'Reached in time',
  monitored: 'Monitored now', monitoredNote: 'every session live',
  inGroup: 'In group', inGroupNote: 'inside the threshold',
  dosesDue: 'Doses due', dosesDueNote: 'now, named aloud',
  liveIncidents: 'Live incidents', awaiting: 'awaiting a supervisor', nothing: 'nothing to report',
  taken: 'Taken', dueNow: 'Due now', dueLater: 'Scheduled', none: 'None',
  notStarted: 'No session running', running: (n) => `Tawaf, circuit ${n} of 7`,
  lastHeard: 'live now', mAway: (d) => d + ' m from group', withGroup: 'with group'
};

const AR = {
  dir: 'rtl', font: "'IBM Plex Sans Arabic', sans-serif", track: 'normal', caps: 'none',
  brand: 'سكينة', roster: 'الحجاج', alerts: 'التنبيهات', makkah: 'مكة',
  raiseCta: 'أطلق بلاغًا تجريبيًا', raiseAnother: 'أطلق بلاغًا تجريبيًا آخر',
  search: 'ابحث بالاسم أو رقم السمّاعة أو المجموعة…', clear: 'مسح',
  filters: [['all', 'الجميع'], ['well', 'مع المجموعة'], ['drift', 'يعود للمجموعة'], ['due', 'دواء مستحق'], ['alert', 'في بلاغ']],
  noMatchTitle: 'لا يوجد حاج مطابق',
  noMatchBody: 'جرّب اسمًا، أو رقم سمّاعة مثل SK-1042، أو حرف مجموعة — أو امسح البحث لعرض الجميع.',
  conditions: 'الحالات الصحية', nextDose: 'الدواء القادم', fromGroup: 'عن المجموعة',
  statusWell: 'مع المجموعة · بخير', statusDrift: 'يعود إلى المجموعة',
  statusDue: 'دواء مستحق الآن', statusAlert: 'حالة مؤكَّدة',
  record: 'ملف الحاج', close: 'إغلاق', schedule: 'جدول الأدوية',
  contact: 'جهة الاتصال للطوارئ', session: 'الجلسة',
  raiseSel: 'محاكاة بلاغ مؤكَّد له', openAlert: 'افتح بلاغه',
  heardYes: 'قال نعم — أُرسلت المساعدة', heardNo: 'يُسأل عن موافقته دائمًا أولًا',
  board: 'اللوحة', live: 'الحيّة', archive: 'الأرشيف',
  allWell: 'كل الحجاج بخير',
  allWellBody: 'تبقى هذه اللوحة فارغة حتى يُسأل حاج إن كان يحتاج مساعدة — ويقول نعم.',
  simulateIncoming: 'محاكاة بلاغ وارد',
  headline: 'حالة مؤكَّدة',
  whatSheHeard: 'ما سمعَته وما قالته',
  heSaid: 'قال', sheSaid: 'قالت', heAnswered: 'أجاب',
  yesPlease: 'نعم، أحتاج مساعدة.',
  medication: 'الدواء', earpiece: 'السمّاعة', lastPosition: 'آخر موقع',
  notifLog: 'سجل الإشعارات', sent: 'أُرسلت', ofSent: 'من ٥ أُرسلت',
  ack: 'استلام · أرسل مشرفًا', acked: 'مُستلَم',
  closeIncident: 'إغلاق الحالة',
  smsNote: 'الرسالة النصية تُعرض كسطر في السجل في هذا النموذج، ولا تُرسل فعليًا. كل ما بين الاكتشاف والبلاغ حقيقي.',
  archiveNote: 'كل حالة تحتفظ بما سمعَته، وما سألت عنه، وكم استغرقت المساعدة — سجل الحملة في العناية بحجاجها.',
  resolvedIn: 'أُنهيت خلال', reachedInTime: 'وصلت المساعدة في وقتها',
  monitored: 'قيد المتابعة', monitoredNote: 'كل جلسة حيّة',
  inGroup: 'مع المجموعة', inGroupNote: 'داخل الحد المسموح',
  dosesDue: 'أدوية مستحقة', dosesDueNote: 'الآن، تُسمّى بصوتها',
  liveIncidents: 'حالات حيّة', awaiting: 'بانتظار مشرف', nothing: 'لا شيء',
  taken: 'أُخذ', dueNow: 'مستحق الآن', dueLater: 'مجدول', none: 'لا يوجد',
  notStarted: 'لا توجد جلسة', running: (n) => `الطواف، الشوط ${n} من ٧`,
  lastHeard: 'حيّ الآن', mAway: (d) => d + ' م عن المجموعة', withGroup: 'مع المجموعة'
};

const ar = (v) => String(v).replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[+d]);
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const QS = new URLSearchParams(location.search);
const FILM = QS.has('film');
const state = {
  lang: QS.get('lang') === 'ar' ? 'ar' : (localStorage.getItem('sk-lang') === 'ar' ? 'ar' : 'en'),
  view: QS.get('view') === 'alerts' ? 'alerts' : 'roster', board: 'live', query: '', filter: 'all', selected: null,
  pilgrims: [], campaign: null, alerts: [], archive: [], rosterState: {},
  clock: '--:--'
};

const L = () => (state.lang === 'ar' ? AR : EN);
const isAr = () => state.lang === 'ar';
const hm = (v) => String(v == null ? '' : v).replace(/^(\d{1,2}:\d{2}):\d{2}$/, '$1');
const num = (v) => { const x = hm(v); return isAr() ? ar(x) : String(x); };
const nm = (p) => (isAr() ? p.name : (p.name_en || p.name));
const nmAlt = (p) => (isAr() ? (p.name_en || p.name) : p.name);
const grp = (p) => (isAr() ? p.groupId : (p.groupId_en || p.groupId));

function makkahNow() {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Riyadh', hour: '2-digit', minute: '2-digit', hour12: false
  }).format(new Date());
}
const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };

/* -------------------- medication, from the real schedule -------------------- */
function doses(p) {
  const t = L();
  const nowM = toMin(makkahNow());
  const out = [];
  for (const med of p.medications || []) {
    const name = isAr() ? med.name : (med.name_en || med.name);
    const dose = isAr() ? med.dose : (med.dose_en || med.dose);
    for (const at of med.times || []) {
      const delta = nowM - toMin(at);
      const due = delta >= -10 && delta <= 60;
      out.push({
        at, mins: toMin(at), due,
        name: `${name} ${dose}`,
        state: due ? t.dueNow : delta > 60 ? t.taken : t.dueLater
      });
    }
  }
  return out.sort((a, b) => a.mins - b.mins);
}
function nextDoseOf(p) {
  const list = doses(p);
  const nowM = toMin(makkahNow());
  return list.find((d) => d.due) || list.find((d) => d.mins > nowM) || list[0] || null;
}

/* ------------------------------ live status ------------------------------ */
const liveFor = (p) => state.rosterState[p.id] || { distance: 0, drifting: false, active: false, step: 1, thresholdM: 40 };
const alertFor = (p) => state.alerts.find((a) => a.pilgrim && a.pilgrim.id === p.id);

function statusOf(p) {
  if (alertFor(p)) return 'alert';
  if (liveFor(p).drifting) return 'drift';
  const nd = nextDoseOf(p);
  if (nd && nd.due) return 'due';
  return 'well';
}

/* -------------------------------- render -------------------------------- */
const root = document.getElementById('sk-web');
const F = () => L().font;

function nav() {
  const t = L(), a = isAr();
  const live = state.alerts.length;
  const onR = state.view === 'roster', onA = state.view === 'alerts';
  const pill = (on) => ({ bg: on ? '#DCB054' : 'transparent', fg: on ? '#143527' : '#FDF8EF', line: on ? '#DCB054' : '#2C6349' });
  const r = pill(onR), al = pill(onA);
  return `
  <nav style="background:#1F4A36;padding:14px 28px;position:sticky;top:0;z-index:5">
    <div style="max-width:1320px;margin:0 auto;display:flex;flex-wrap:wrap;gap:18px;align-items:center;justify-content:space-between">
      <div style="display:flex;align-items:center;gap:14px;min-width:0">
        <svg width="38" height="38" viewBox="0 0 120 120" role="img" aria-label="Sakeenah" style="display:block;flex:none">
          <path d="M60 4c34 0 56 20 56 56s-22 56-56 56S4 94 4 60 26 4 60 4z" fill="#FDF8EF"></path>
          <g transform="rotate(-18 60 60)">
            <path d="M50 28C66 46 66 74 50 92C34 74 34 46 50 28Z" fill="#1F4A36"></path>
            <path d="M70 28C86 46 86 74 70 92C54 74 54 46 70 28Z" fill="#B8862B"></path>
          </g>
        </svg>
        <div style="display:flex;flex-direction:column;min-width:0">
          <span style="font-size:22px;font-weight:700;color:#FDF8EF;line-height:1.2;letter-spacing:-0.02em">${esc(t.brand)}</span>
          <span style="font-size:16px;color:#DCB054;line-height:1.3">${esc(state.campaign ? (isAr() ? state.campaign.name : (state.campaign.name_en || state.campaign.name)) : '')} · ${esc(num(state.pilgrims.length))}</span>
        </div>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center">
        <button type="button" class="w-f-gold" data-act="view" data-arg="roster" style="font-family:${F()};font-size:17px;font-weight:700;border-radius:999px;min-height:48px;padding:0 22px;cursor:pointer;border:2px solid ${r.line};background:${r.bg};color:${r.fg}">${esc(t.roster)}</button>
        <button type="button" class="w-f-gold" data-act="view" data-arg="alerts" style="font-family:${F()};font-size:17px;font-weight:700;border-radius:999px;min-height:48px;padding:0 22px;cursor:pointer;border:2px solid ${al.line};background:${al.bg};color:${al.fg};display:flex;align-items:center;gap:10px">
          ${esc(t.alerts)}
          ${live ? `<span style="font-size:16px;font-weight:700;color:#FDF8EF;background:#9E2F1C;border-radius:999px;min-width:28px;padding:2px 8px;animation:sk-pulse 1.7s ease-in-out infinite">${esc(num(live))}</span>` : ''}
        </button>
        <span style="width:2px;height:28px;background:#2C6349;display:block;margin:0 4px"></span>
        <span style="font-size:17px;font-weight:700;color:#FDF8EF;font-variant-numeric:tabular-nums">${esc(t.makkah)} ${esc(num(state.clock))}</span>
        ${FILM ? '' : `<button type="button" class="w-dark w-f-gold" data-act="raise" style="font-family:${F()};font-size:17px;font-weight:600;border-radius:999px;min-height:48px;padding:0 20px;cursor:pointer;border:2px dashed #DCB054;background:transparent;color:#DCB054">${esc(live ? t.raiseAnother : t.raiseCta)}</button>`}
        <span style="display:flex;gap:8px;flex:none;${FILM ? 'display:none' : ''}">
          <button type="button" class="w-f-gold" data-act="lang" data-arg="en" style="font-family:Inter,sans-serif;font-size:16px;font-weight:700;border-radius:999px;min-height:44px;min-width:48px;cursor:pointer;border:2px solid #2C6349;background:${a ? 'transparent' : '#FDF8EF'};color:${a ? '#FDF8EF' : '#143527'}">EN</button>
          <button type="button" class="w-f-gold" data-act="lang" data-arg="ar" style="font-family:'IBM Plex Sans Arabic',sans-serif;font-size:16px;font-weight:700;border-radius:999px;min-height:44px;min-width:48px;cursor:pointer;border:2px solid #2C6349;background:${a ? '#FDF8EF' : 'transparent'};color:${a ? '#143527' : '#FDF8EF'}">ع</button>
        </span>
      </div>
    </div>
  </nav>`;
}

function stats() {
  const t = L();
  const live = state.alerts.length;
  const drift = state.pilgrims.filter((p) => statusOf(p) === 'drift').length;
  const due = state.pilgrims.filter((p) => statusOf(p) === 'due').length;
  const total = state.pilgrims.length;
  const cards = [
    { label: t.monitored, value: num(total), note: t.monitoredNote, line: BROWN, ink: '#143527' },
    { label: t.inGroup, value: num(Math.max(0, total - live - drift)), note: t.inGroupNote, line: BROWN, ink: '#143527' },
    { label: t.dosesDue, value: num(due), note: t.dosesDueNote, line: due ? '#C79A3C' : BROWN, ink: due ? AMBER : '#143527' },
    { label: t.liveIncidents, value: num(live), note: live ? t.awaiting : t.nothing, line: live ? RED : OK, ink: live ? RED : OK }
  ];
  return `
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:18px">
    ${cards.map((s) => `
      <div style="background:#FDF8EF;border:2px solid ${s.line};border-radius:24px;padding:18px 22px;display:flex;flex-direction:column;gap:2px">
        <span style="font-size:17px;font-weight:700;letter-spacing:${t.track};text-transform:${t.caps};color:#4A3220">${esc(s.label)}</span>
        <span style="font-size:34px;font-weight:700;line-height:1.15;color:${s.ink};font-variant-numeric:tabular-nums">${esc(s.value)}</span>
        <span style="font-size:17px;color:#4A3220">${esc(s.note)}</span>
      </div>`).join('')}
  </div>`;
}

function rosterView() {
  const t = L();
  const q = state.query.trim().toLowerCase();
  const label = { well: t.statusWell, drift: t.statusDrift, due: t.statusDue, alert: t.statusAlert };
  const band = { well: GREEN, drift: '#8A5A10', due: '#8A5A10', alert: RED };

  const matches = state.pilgrims.filter((p) => {
    const st = statusOf(p);
    if (state.filter !== 'all' && state.filter !== st) return false;
    if (!q) return true;
    return [p.name, p.name_en, p.earpieceId, p.groupId, p.groupId_en, p.nationality, p.nationality_en]
      .filter(Boolean).join(' ').toLowerCase().indexOf(q) > -1;
  });

  const rows = matches.map((p) => {
    const st = statusOf(p);
    const lv = liveFor(p);
    const nd = nextDoseOf(p);
    const far = lv.distance > (lv.thresholdM || 40);
    return `
    <button type="button" class="w-row w-f" data-act="select" data-arg="${esc(p.id)}" style="font-family:${F()};text-align:start;background:#FDF8EF;border:2px solid ${st === 'alert' ? RED : BROWN};border-radius:28px;padding:0;overflow:hidden;cursor:pointer;display:flex;flex-direction:column;box-shadow:${st === 'alert' ? '0 18px 36px -22px rgba(44,35,24,0.6)' : '0 2px 4px rgba(44,35,24,0.05)'}">
      <span style="background:${band[st]};padding:12px 24px;display:flex;flex-wrap:wrap;gap:12px;justify-content:space-between;align-items:center;width:100%;box-sizing:border-box">
        <span style="font-size:17px;font-weight:700;letter-spacing:${t.track};text-transform:${t.caps};color:#FDF8EF">${esc(grp(p))} · <span class="ltr">${esc(p.earpieceId)}</span></span>
        <span style="font-size:17px;font-weight:700;color:#FDF8EF">${esc(label[st])}</span>
      </span>
      <span style="padding:20px 24px;display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:18px;width:100%;box-sizing:border-box;align-items:start">
        <span style="display:flex;flex-direction:column;gap:3px;min-width:0">
          <span style="font-size:24px;font-weight:700;line-height:1.3;color:#143527">${esc(nm(p))}</span>
          <span dir="${isAr() ? 'ltr' : 'rtl'}" style="font-family:${isAr() ? 'Inter,sans-serif' : "'IBM Plex Sans Arabic',sans-serif"};font-size:18px;line-height:1.7;font-weight:600;color:#4A3220">${esc(nmAlt(p))}</span>
          <span style="font-size:18px;color:#2C2318">${esc(num(p.age))} · ${esc(isAr() ? p.nationality : (p.nationality_en || p.nationality))}</span>
        </span>
        <span style="display:flex;flex-direction:column;gap:3px;min-width:0">
          <span style="font-size:17px;font-weight:700;letter-spacing:${t.track};text-transform:${t.caps};color:#4A3220">${esc(t.conditions)}</span>
          <span style="font-size:18px;line-height:1.5">${esc(isAr() ? p.condition : (p.condition_en || p.condition))}</span>
        </span>
        <span style="display:flex;flex-direction:column;gap:3px;min-width:0">
          <span style="font-size:17px;font-weight:700;letter-spacing:${t.track};text-transform:${t.caps};color:#4A3220">${esc(t.nextDose)}</span>
          <span style="font-size:22px;font-weight:700;font-variant-numeric:tabular-nums;color:${st === 'due' ? AMBER : '#143527'}">${esc(nd ? num(nd.at) : t.none)}</span>
        </span>
        <span style="display:flex;flex-direction:column;gap:3px;min-width:0">
          <span style="font-size:17px;font-weight:700;letter-spacing:${t.track};text-transform:${t.caps};color:#4A3220">${esc(t.fromGroup)}</span>
          <span style="font-size:22px;font-weight:700;font-variant-numeric:tabular-nums;color:${far ? AMBER : '#143527'}">${esc(num(lv.distance))}${isAr() ? ' م' : ' m'}</span>
        </span>
      </span>
    </button>`;
  }).join('');

  const empty = `
    <div style="background:#FDF8EF;border:2px dashed #6B4A2E;border-radius:28px;padding:56px 28px;display:flex;flex-direction:column;gap:12px;align-items:center;text-align:center">
      <span style="font-size:26px;font-weight:700;color:#143527">${esc(t.noMatchTitle)}</span>
      <span style="font-size:19px;color:#4A3220;max-width:44ch">${esc(t.noMatchBody)}</span>
    </div>`;

  return `
  <div style="display:flex;flex-wrap:wrap;gap:26px;align-items:flex-start">
    <div style="flex:1 1 560px;min-width:300px;display:flex;flex-direction:column;gap:20px">
      <div style="display:flex;flex-direction:column;gap:14px">
        <div style="display:flex;flex-wrap:wrap;gap:14px;align-items:center">
          <input id="w-q" type="text" value="${esc(state.query)}" placeholder="${esc(t.search)}" class="w-f" style="flex:1 1 260px;min-width:0;font-family:${F()};font-size:19px;color:#2C2318;background:#FDF8EF;border:2px solid #6B4A2E;border-radius:999px;min-height:58px;padding:0 22px;box-sizing:border-box">
          <button type="button" class="w-pale w-f" data-act="clearq" style="flex:none;font-family:${F()};font-size:17px;font-weight:600;color:#4A3220;background:#FDF8EF;border:2px solid #6B4A2E;border-radius:999px;min-height:58px;padding:0 22px;cursor:pointer">${esc(t.clear)}</button>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:10px">
          ${t.filters.map(([k, lbl]) => {
            const on = state.filter === k;
            return `<button type="button" class="w-f" data-act="filter" data-arg="${k}" style="font-family:${F()};font-size:17px;font-weight:600;border-radius:999px;min-height:48px;padding:0 20px;cursor:pointer;border:2px solid ${GREEN};background:${on ? GREEN : '#FDF8EF'};color:${on ? '#FDF8EF' : '#1F4A36'}">${esc(lbl)}</button>`;
          }).join('')}
        </div>
      </div>
      ${rows || empty}
    </div>
    ${drawer()}
  </div>`;
}

function drawer() {
  const p = state.pilgrims.find((x) => x.id === state.selected);
  if (!p) return '';
  const t = L();
  const st = statusOf(p);
  const band = { well: GREEN, drift: '#8A5A10', due: '#8A5A10', alert: RED }[st];
  const lv = liveFor(p);
  const ec = p.emergencyContact || {};
  const sessionLine = lv.active
    ? `${t.running(num(lv.step))} · ${lv.drifting ? t.mAway(num(lv.distance)) : t.withGroup} · ${t.lastHeard}`
    : t.notStarted;

  return `
  <div style="flex:1 1 360px;min-width:300px;position:sticky;top:110px;background:#FDF8EF;border:2px solid #6B4A2E;border-radius:28px;overflow:hidden;box-shadow:0 22px 44px -22px rgba(44,35,24,0.6);animation:sk-drawer 240ms ease-out both">
    <div style="background:${band};padding:16px 24px;display:flex;flex-wrap:wrap;gap:12px;justify-content:space-between;align-items:center">
      <span style="font-size:17px;font-weight:700;letter-spacing:${t.track};text-transform:${t.caps};color:#FDF8EF">${esc(t.record)}</span>
      <button type="button" class="w-f-gold" data-act="closesel" style="font-family:${F()};font-size:17px;font-weight:700;color:#FDF8EF;background:transparent;border:2px solid #FDF8EF;border-radius:999px;min-height:44px;padding:0 16px;cursor:pointer">${esc(t.close)}</button>
    </div>
    <div style="padding:24px;display:flex;flex-direction:column;gap:20px">
      <div style="display:flex;flex-direction:column;gap:4px">
        <span style="font-size:26px;font-weight:700;line-height:1.25;color:#143527">${esc(nm(p))}</span>
        <span dir="${isAr() ? 'ltr' : 'rtl'}" style="font-family:${isAr() ? 'Inter,sans-serif' : "'IBM Plex Sans Arabic',sans-serif"};font-size:19px;line-height:1.7;font-weight:600;color:#4A3220">${esc(nmAlt(p))}</span>
        <span style="font-size:18px;color:#2C2318">${esc(num(p.age))} · ${esc(isAr() ? p.nationality : (p.nationality_en || p.nationality))} · ${esc(grp(p))} · <span class="ltr">${esc(p.earpieceId)}</span></span>
      </div>

      <div style="display:flex;flex-direction:column;gap:10px">
        <span style="font-size:17px;font-weight:700;letter-spacing:${t.track};text-transform:${t.caps};color:#4A3220">${esc(t.schedule)}</span>
        ${doses(p).map((d) => `
          <div style="display:flex;gap:14px;align-items:center;background:${d.due ? '#FAEDCF' : '#FDF8EF'};border:2px solid ${d.due ? '#C79A3C' : BROWN};border-radius:20px;padding:12px 16px">
            <span style="flex:none;font-size:20px;font-weight:700;font-variant-numeric:tabular-nums;color:${d.due ? AMBER : '#143527'};min-width:62px">${esc(num(d.at))}</span>
            <span style="display:flex;flex-direction:column;min-width:0">
              <span style="font-size:18px;font-weight:700;line-height:1.3">${esc(d.name)}</span>
              <span style="font-size:17px;color:#4A3220">${esc(d.state)}</span>
            </span>
          </div>`).join('') || `<span style="font-size:18px;color:#4A3220">${esc(t.none)}</span>`}
      </div>

      <div style="display:flex;flex-direction:column;gap:6px">
        <span style="font-size:17px;font-weight:700;letter-spacing:${t.track};text-transform:${t.caps};color:#4A3220">${esc(t.contact)}</span>
        <span style="font-size:20px;font-weight:700;line-height:1.4;font-variant-numeric:tabular-nums">${esc(isAr() ? ec.name : (ec.name_en || ec.name))} · <span class="ltr">${esc(ec.phone || '')}</span></span>
      </div>

      <div style="display:flex;flex-direction:column;gap:6px">
        <span style="font-size:17px;font-weight:700;letter-spacing:${t.track};text-transform:${t.caps};color:#4A3220">${esc(t.session)}</span>
        <span style="font-size:18px;line-height:1.5">${esc(sessionLine)}</span>
      </div>

      <div style="display:flex;flex-wrap:wrap;gap:12px;border-top:2px solid #D9C8A7;padding-top:18px">
        ${st === 'alert'
          ? `<button type="button" class="w-red w-f" data-act="view" data-arg="alerts" style="font-family:${F()};font-size:18px;font-weight:600;color:#FDF8EF;background:#9E2F1C;border:2px solid #9E2F1C;border-radius:999px;min-height:56px;padding:0 22px;cursor:pointer">${esc(t.openAlert)}</button>`
          : `<button type="button" class="w-red w-f" data-act="raise" data-arg="${esc(p.id)}" style="font-family:${F()};font-size:18px;font-weight:600;color:#FDF8EF;background:#9E2F1C;border:2px solid #9E2F1C;border-radius:999px;min-height:56px;padding:0 22px;cursor:pointer">${esc(t.raiseSel)}</button>`}
        <span style="font-size:17px;color:#4A3220;align-self:center">${esc(st === 'alert' ? t.heardYes : t.heardNo)}</span>
      </div>
    </div>
  </div>`;
}

function alertsView() {
  const t = L();
  const liveOn = state.board === 'live';
  const tabs = `
    <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;background:#FDF8EF;border:2px solid #6B4A2E;border-radius:999px;padding:12px 18px">
      <span style="font-size:17px;font-weight:700;letter-spacing:${t.track};text-transform:${t.caps};color:#4A3220">${esc(t.board)}</span>
      <button type="button" class="w-f" data-act="board" data-arg="live" style="font-family:${F()};font-size:17px;font-weight:600;border-radius:999px;min-height:48px;padding:0 22px;cursor:pointer;border:2px solid #9E2F1C;background:${liveOn ? RED : '#FDF8EF'};color:${liveOn ? '#FDF8EF' : RED}">${esc(t.live)}</button>
      <button type="button" class="w-f" data-act="board" data-arg="archive" style="font-family:${F()};font-size:17px;font-weight:600;border-radius:999px;min-height:48px;padding:0 22px;cursor:pointer;border:2px solid #6B4A2E;background:${liveOn ? '#FDF8EF' : BROWN};color:${liveOn ? '#4A3220' : '#FDF8EF'}">${esc(t.archive)}</button>
    </div>`;

  const empty = `
    <div style="background:#FDF8EF;border:2px solid #6B4A2E;border-radius:28px;padding:80px 32px;display:flex;flex-direction:column;gap:18px;align-items:center;text-align:center">
      <span style="width:92px;height:92px;border-radius:999px;background:#F5ECDB;border:2px solid #2C7A51;display:flex;align-items:center;justify-content:center">
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#2C7A51" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg>
      </span>
      <span style="font-size:34px;font-weight:700;line-height:1.2;color:#143527">${esc(t.allWell)}</span>
      <p style="margin:0;font-size:19px;color:#4A3220;max-width:46ch">${esc(t.allWellBody)}</p>
      <button type="button" class="w-pale w-f" data-act="raise" style="font-family:${F()};font-size:19px;font-weight:600;color:#1F4A36;background:#FDF8EF;border:2px solid #1F4A36;border-radius:999px;min-height:58px;padding:0 26px;cursor:pointer;margin-top:6px">${esc(t.simulateIncoming)}</button>
    </div>`;

  const cards = state.alerts.map((a) => {
    const p = a.pilgrim || {};
    const ec = p.emergencyContact || {};
    const dotFor = (i) => (i <= 1 ? RED : i <= 3 ? AMBER : GREEN);
    const log = (a.notifications || []).map((l, i) => `
      <div style="display:flex;gap:14px;align-items:flex-start;padding-bottom:12px;border-bottom:2px solid #D9C8A7;animation:sk-row 260ms ease-out both">
        <span style="flex:none;font-size:17px;font-weight:700;color:#4A3220;font-variant-numeric:tabular-nums;min-width:52px">${esc(num(l.at || a.at))}</span>
        <span style="flex:none;width:13px;height:13px;border-radius:999px;background:${l.ack ? OK : dotFor(i)};margin-top:7px;display:block"></span>
        <span style="font-size:18px;line-height:1.5;min-width:0">${esc(isAr() ? l.text : (l.text_en || l.text))}</span>
      </div>`).join('');

    const meds = (p.medications || [])
      .map((m) => `${isAr() ? m.name : (m.name_en || m.name)} ${isAr() ? m.dose : (m.dose_en || m.dose)}`)
      .join(' · ') || t.none;
    const dist = a.location && a.location.distanceFromGroup != null ? Math.round(a.location.distanceFromGroup) : null;

    return `
    <div style="background:#FBE8E1;border:2px solid #9E2F1C;border-radius:28px;overflow:hidden;box-shadow:0 22px 44px -22px rgba(44,35,24,0.6);animation:sk-row 300ms ease-out both">
      <div style="background:#9E2F1C;padding:16px 26px;display:flex;flex-wrap:wrap;gap:14px;justify-content:space-between;align-items:center">
        <span style="display:flex;align-items:center;gap:12px;font-size:19px;font-weight:700;letter-spacing:0.06em;text-transform:${t.caps};color:#FDF8EF"><span style="width:13px;height:13px;border-radius:999px;background:#FDF8EF;display:block;animation:sk-pulse 1.7s ease-in-out infinite"></span>${esc(t.headline)}</span>
        <span style="font-size:19px;font-weight:700;color:#FDF8EF;font-variant-numeric:tabular-nums">${esc(num(a.at))} · ${esc(isAr() ? p.groupId : (p.groupId_en || p.groupId))}</span>
      </div>

      <div style="padding:26px;display:flex;flex-wrap:wrap;gap:26px;align-items:flex-start">
        <div style="flex:1 1 320px;min-width:260px;display:flex;flex-direction:column;gap:18px">
          <div style="display:flex;flex-direction:column;gap:4px">
            <span style="font-size:28px;font-weight:700;line-height:1.2;color:#2C2318">${esc(isAr() ? p.name : (p.name_en || p.name))} · ${esc(num(p.age))}</span>
            <span dir="${isAr() ? 'ltr' : 'rtl'}" style="font-family:${isAr() ? 'Inter,sans-serif' : "'IBM Plex Sans Arabic',sans-serif"};font-size:19px;line-height:1.7;font-weight:600;color:#4A3220">${esc(isAr() ? (p.name_en || p.name) : p.name)}</span>
          </div>

          <div style="background:#FDF8EF;border:2px solid #9E2F1C;border-radius:20px;padding:18px 20px;display:flex;flex-direction:column;gap:12px">
            <span style="font-size:17px;font-weight:700;letter-spacing:${t.track};text-transform:${t.caps};color:#9E2F1C">${esc(t.whatSheHeard)}</span>
            ${a.signals && a.signals.length ? `<span style="font-size:19px;line-height:1.55;color:#4A3220">${esc(t.heSaid)}: “${esc(a.signals.join(' · '))}”</span>` : ''}
            <span style="font-size:19px;line-height:1.55;color:#143527">${esc(t.sheSaid)}: “${esc(a.spoken || '')}”</span>
            <span style="font-size:19px;line-height:1.55;font-weight:600">${esc(t.heAnswered)}: “${esc(t.yesPlease)}” · ${esc(num(a.at))}</span>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px">
            ${[[t.conditions, isAr() ? p.condition : (p.condition_en || p.condition)],
               [t.medication, meds],
               [t.earpiece, p.earpieceId],
               [t.lastPosition, dist == null ? '—' : (dist + (isAr() ? ' م' : ' m'))]
              ].map(([k, v]) => `
              <div style="background:#FDF8EF;border:2px solid #D8A291;border-radius:20px;padding:12px 16px;display:flex;flex-direction:column">
                <span style="font-size:17px;color:#4A3220">${esc(k)}</span>
                <span style="font-size:18px;font-weight:700;line-height:1.4;font-variant-numeric:tabular-nums">${esc(v || '—')}</span>
              </div>`).join('')}
          </div>

          <div style="background:#FDF8EF;border:2px solid #9E2F1C;border-radius:20px;padding:16px 20px;display:flex;flex-direction:column;gap:2px">
            <span style="font-size:17px;font-weight:700;letter-spacing:${t.track};text-transform:${t.caps};color:#9E2F1C">${esc(t.contact)}</span>
            <span style="font-size:21px;font-weight:700;font-variant-numeric:tabular-nums">${esc(isAr() ? ec.name : (ec.name_en || ec.name))} · <span class="ltr">${esc(ec.phone || '')}</span></span>
          </div>

          <div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center">
            ${a.acked
              ? `<span style="font-size:18px;font-weight:700;color:#1F4A36;background:#F5ECDB;border:2px solid #2C7A51;border-radius:999px;padding:12px 20px">${esc(t.acked)} · ${esc(a.supervisor || '')}</span>
                 <button type="button" class="w-ok w-f" data-act="resolve" data-arg="${esc(a.id)}" style="font-family:${F()};font-size:19px;font-weight:600;color:#FDF8EF;background:#2C7A51;border:2px solid #2C7A51;border-radius:999px;min-height:60px;padding:0 26px;cursor:pointer">${esc(t.closeIncident)}</button>`
              : `<button type="button" class="w-red w-f" data-act="ack" data-arg="${esc(a.id)}" style="font-family:${F()};font-size:19px;font-weight:600;color:#FDF8EF;background:#9E2F1C;border:2px solid #9E2F1C;border-radius:999px;min-height:60px;padding:0 26px;cursor:pointer">${esc(t.ack)}</button>`}
          </div>
        </div>

        <div style="flex:1 1 280px;min-width:260px;background:#FDF8EF;border:2px solid #6B4A2E;border-radius:24px;padding:20px 22px;display:flex;flex-direction:column;gap:14px">
          <div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:space-between;align-items:baseline">
            <span style="font-size:17px;font-weight:700;letter-spacing:${t.track};text-transform:${t.caps};color:#4A3220">${esc(t.notifLog)}</span>
            <span style="font-size:17px;font-weight:600;color:#4A3220;font-variant-numeric:tabular-nums">${esc(num((a.notifications || []).length))} ${esc(a.acked ? t.sent : t.ofSent)}</span>
          </div>
          ${log}
          <span style="font-size:17px;color:#4A3220">${esc(t.smsNote)}</span>
        </div>
      </div>
    </div>`;
  }).join('');

  const archive = state.archive.map((a) => `
    <div style="background:#FDF8EF;border:2px solid #6B4A2E;border-radius:24px;padding:20px 24px;display:flex;flex-wrap:wrap;gap:18px;justify-content:space-between;align-items:center">
      <div style="display:flex;flex-direction:column;gap:3px;min-width:260px">
        <span style="font-size:17px;font-weight:700;letter-spacing:${t.track};text-transform:${t.caps};color:#4A3220">${esc(isAr() ? a.at : (a.at_en || a.at))} · <span class="ltr">${esc(a.earpieceId || '')}</span></span>
        <span style="font-size:23px;font-weight:700;line-height:1.3;color:#143527">${esc(isAr() ? a.pilgrimName : (a.pilgrimName_en || a.pilgrimName))}</span>
        <span style="font-size:18px;color:#2C2318">${esc(isAr() ? a.type : (a.type_en || a.type))}</span>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center">
        <span style="font-size:17px;font-weight:700;color:#1F4A36;background:#F5ECDB;border:2px solid #2C7A51;border-radius:999px;padding:8px 18px">${esc(t.reachedInTime)}</span>
        <span style="font-size:17px;font-weight:600;color:#4A3220;max-width:46ch">${esc(isAr() ? a.outcome : (a.outcome_en || a.outcome))}</span>
      </div>
    </div>`).join('');

  return `
  <div style="display:flex;flex-direction:column;gap:22px">
    ${tabs}
    ${liveOn
      ? (state.alerts.length ? cards : empty)
      : `<div style="display:flex;flex-direction:column;gap:16px">${archive}
           <p style="margin:0;font-size:17px;color:#4A3220;max-width:72ch">${esc(t.archiveNote)}</p>
         </div>`}
  </div>`;
}

let scrollY = 0;
function render() {
  const t = L();
  scrollY = window.scrollY;
  const focused = document.activeElement && document.activeElement.id === 'w-q';
  const caret = focused ? document.activeElement.selectionStart : null;

  root.innerHTML = `
    <div dir="${t.dir}" style="background:#F2E8D7;color:#2C2318;font-family:${F()};font-size:19px;line-height:1.6;min-height:100%;box-sizing:border-box;padding-bottom:64px">
      ${nav()}
      <div style="padding:32px 28px 0">
        <div style="max-width:1320px;margin:0 auto;display:flex;flex-direction:column;gap:26px">
          ${stats()}
          ${state.view === 'roster' ? rosterView() : alertsView()}
        </div>
      </div>
    </div>`;

  window.scrollTo(0, scrollY);
  if (focused) {
    const el = document.getElementById('w-q');
    if (el) { el.focus(); try { el.setSelectionRange(caret, caret); } catch (_) {} }
  }
}

/* ------------------------------- events -------------------------------- */
const post = (url, body) =>
  fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) })
    .then((r) => r.json());

root.addEventListener('click', (e) => {
  const b = e.target.closest('[data-act]');
  if (!b) return;
  const act = b.dataset.act, arg = b.dataset.arg;
  if (act === 'view') { state.view = arg; if (arg === 'alerts') state.board = 'live'; render(); }
  else if (act === 'lang') {
    state.lang = arg; localStorage.setItem('sk-lang', arg);
    document.documentElement.lang = arg; document.documentElement.dir = L().dir;
    render();
  }
  else if (act === 'filter') { state.filter = arg; render(); }
  else if (act === 'clearq') { state.query = ''; state.filter = 'all'; render(); }
  else if (act === 'select') { state.selected = state.selected === arg ? null : arg; render(); }
  else if (act === 'closesel') { state.selected = null; render(); }
  else if (act === 'board') { state.board = arg; render(); }
  else if (act === 'raise') { post('/api/alerts/raise', arg ? { pilgrimId: arg } : {}); state.view = 'alerts'; state.board = 'live'; render(); }
  else if (act === 'ack') post(`/api/alerts/${encodeURIComponent(arg)}/ack`);
  else if (act === 'resolve') post(`/api/alerts/${encodeURIComponent(arg)}/resolve`);
});

root.addEventListener('input', (e) => {
  if (e.target.id !== 'w-q') return;
  state.query = e.target.value;
  render();
});

/* يقودها موقع التصوير · the film set drives the view without a reload */
addEventListener('message', (e) => {
  const d = e.data || {};
  if (d.sakeenah !== 'view') return;
  if (d.view === 'roster' || d.view === 'alerts') { state.view = d.view; state.board = 'live'; render(); }
  if (d.select) { state.selected = d.select; render(); }
});

/* ------------------------------- sockets -------------------------------- */
const socket = io();

socket.on('alert', (a) => {
  if (!state.alerts.some((x) => x.id === a.id)) state.alerts.unshift(a);
  state.view = 'alerts'; state.board = 'live';
  render();
});

socket.on('alert-log', (line) => {
  const a = state.alerts.find((x) => x.id === line.alertId);
  if (!a) return;
  a.notifications = a.notifications || [];
  if (!a.notifications.some((l) => l.text_en === line.text_en && l.at === line.at)) a.notifications.push(line);
  if (state.view === 'alerts') render();
});

socket.on('alert-ack', ({ id, supervisor }) => {
  const a = state.alerts.find((x) => x.id === id);
  if (!a) return;
  a.acked = true; a.supervisor = supervisor;
  render();
});

socket.on('alert-resolved', ({ id, closed }) => {
  state.alerts = state.alerts.filter((x) => x.id !== id);
  if (closed) state.archive.unshift(closed);
  render();
});

socket.on('roster-state', (list) => {
  let changed = false;
  for (const r of list) {
    const prev = state.rosterState[r.id];
    if (!prev || prev.distance !== r.distance || prev.drifting !== r.drifting || prev.active !== r.active || prev.step !== r.step) changed = true;
    state.rosterState[r.id] = r;
  }
  if (changed && state.view === 'roster') render();
});

/* -------------------------------- boot ---------------------------------- */
(async function boot() {
  const [db, live] = await Promise.all([
    fetch('/api/campaign').then((r) => r.json()),
    fetch('/api/alerts').then((r) => r.json())
  ]);
  state.campaign = db.campaign;
  state.pilgrims = db.pilgrims || [];
  state.alerts = live.alerts || [];
  state.archive = live.resolvedIncidents || db.resolvedIncidents || [];
  state.clock = makkahNow();
  document.documentElement.lang = state.lang;
  document.documentElement.dir = L().dir;
  render();
  setInterval(() => { state.clock = makkahNow(); render(); }, 20000);
})();
