/* سكينة — طبقة اللغة · Sakeenah bilingual layer (EN default, AR optional) */
(() => {
  'use strict';

  const DICT = {
    en: {
      'brand.name': 'Sakeenah',
      'brand.tag': 'An AI voice companion for Hajj pilgrims',
      'nav.roster': 'Campaign Dashboard',
      'nav.agent': 'Pilgrim App',
      'nav.alerts': 'Live Alerts',

      'agent.title': 'Sakeenah Voice Companion',
      'agent.sub': 'This is what the pilgrim hears through his earpiece. Speak to her, and she answers aloud.',
      'agent.conv': 'Voice conversation',
      'agent.connected': 'Connected',
      'agent.disconnected': 'Disconnected',
      'agent.pilgrimCard': 'Registered pilgrim',
      'agent.sessionState': 'Session status',

      'mic.start': 'Start session',
      'mic.stop': 'End session',
      'mic.listening': "I'm listening",
      'mic.thinking': 'One moment…',
      'mic.speaking': 'Sakeenah is speaking',

      'status.initial': 'Press the button to start the session and allow the microphone',
      'status.speakNow': 'Speak now…',
      'status.started': 'Session started — Sakeenah will greet you, then listen',
      'status.ended': 'Session ended. Press to start a new one.',
      'status.noSpeech': "I didn't catch that — please speak a little louder.",
      'status.micBlocked': 'The browser blocked the microphone. Allow access, then try again.',
      'status.noSR': 'Speech recognition works in Chrome. You can use the text box below instead.',

      'mic.meterHint': 'Audio level — this moves when you speak',
      'mic.device': 'Microphone',
      'mic.silent': 'No sound is reaching the microphone — check your Windows input device, or close another app that is using the mic.',
      'mic.blocked': 'The browser blocked the microphone — click the lock icon next to the address bar and allow it.',
      'mic.failed': 'Could not open the microphone',
      'mic.pick': 'Microphone:',

      'text.placeholder': 'Or type what the pilgrim says (backup if the mic fails)…',
      'btn.send': 'Send',

      'sim.summary': 'Location tracking · demo simulation or real GPS',
      'sim.body': 'The detection is real either way: it measures the distance between the pilgrim and his group, and when it passes the alert distance it detects the drift automatically and asks Sakeenah to guide him back. Demo simulation drives the persona along a scripted path so you can show it indoors; real GPS uses this device\u2019s actual position through the same logic.',
      'sim.drift': 'Trigger drift now',
      'sim.return': 'Return him to the group',

      'gps.sim': 'Demo simulation',
      'gps.real': 'Real GPS (this device)',
      'gps.anchor': 'Set group point here',
      'gps.threshold': 'Alert distance',
      'gps.waiting': 'Waiting for a GPS fix from this device…',
      'gps.denied': 'Location permission was denied. Allow location for this site and try again.',
      'gps.unsupported': 'This browser does not provide geolocation.',
      'gps.fix': 'Live GPS · accuracy',
      'gps.anchored': 'Group point set at your current position. Walk away from it to trigger the drift alert.',
      'gps.realNote': 'Real GPS is on: this device now reports its actual position, and the same detection logic runs on it. Indoors, accuracy can be 20-50 m, so set the alert distance above that.',
      'state.gpsSim': 'simulated',
      'state.gpsReal': 'live GPS',
      'demo.summary': 'Demo triggers · for screen recording',
      'demo.body': 'Real medication times and real GPS keep running untouched. These buttons fire the exact same events the system raises on its own, so you can record every feature without waiting for 20:00 or walking 80 metres.',
      'demo.med': 'Medication reminder',
      'demo.drift': 'Drifted from group',
      'demo.back': 'Rejoined group',
      'demo.fall': 'Fall detected',
      'demo.fallNote': 'The fall sensor is simulated — the earpiece hardware is not built yet. Everything after the detection is real: Sakeenah checks on him, asks before alerting, and waits for his answer.',
      'sys.fall': 'Fall detected by earpiece sensor',

      'state.step': 'Tawaf step',
      'state.distance': 'Distance from group',
      'state.med': 'Next medication',
      'state.distress': 'Distress monitoring',
      'state.on': 'Active',
      'state.awaiting': 'Awaiting confirmation',
      'state.emergency': 'Emergency confirmed',
      'state.none': 'None',
      'state.of': 'of',

      'who.pilgrim': 'Pilgrim',
      'who.sakeenah': 'Sakeenah',
      'sys.medication': 'Automatic medication reminder',
      'sys.drift': 'Drift from group detected',
      'sys.driftResolved': 'Rejoined his group',
      'sys.event': 'System event',

      'banner.confirm': '<b>A distress signal was detected in the pilgrim speech.</b> Sakeenah is now asking him: “Do you need help?” — no alert is sent until he confirms.',
      'banner.signals': 'Signals:',
      'banner.emergency': '<b>The pilgrim confirmed he needs help.</b> A live alert was sent to the alerts board with his registered details, and his emergency contact and campaign leader were notified.',
      'banner.noKey': '<b>Note:</b> the Gemini key is not set on the server. Put GEMINI_API_KEY in your .env file and restart.',
      'banner.fallback': '<b>Team note:</b> Gemini could not be reached, so Sakeenah is running on the local fallback.',
      'banner.quota': '<b>Team note:</b> the Gemini free-tier quota for this key is used up, so Sakeenah is running on the local fallback. The demo still works end to end. Check your usage at ai.dev/rate-limit, or use a second key.',

      'card.name': 'Name',
      'card.age': 'Age',
      'card.years': 'years',
      'card.condition': 'Medical conditions',
      'card.contact': 'Emergency contact',
      'card.earpiece': 'Earpiece',

      'roster.title': 'Campaign Dashboard',
      'roster.sub': 'Pilgrims registered under this campaign, with their medical details and earpiece IDs.',
      'roster.tableTitle': 'Registered pilgrims',
      'roster.count': 'pilgrims registered',
      'roster.leader': 'Campaign leader:',
      'roster.id': 'Campaign ID',
      'th.pilgrim': 'Pilgrim',
      'th.age': 'Age',
      'th.condition': 'Medical conditions',
      'th.meds': 'Medications and times',
      'th.earpiece': 'Earpiece ID',
      'th.group': 'Group',
      'th.contact': 'Emergency contact',
      'risk.high': 'High risk',
      'risk.mid': 'Medium risk',
      'risk.low': 'Standard',
      'demo.badge': 'Demo pilgrim',
      'meds.none': 'None',

      'alerts.title': 'Live Alerts',
      'alerts.sub': 'Alerts arrive here the moment a pilgrim confirms he needs help, pulled from his registered details on the campaign dashboard.',
      'alerts.active': 'Active emergency alerts',
      'alerts.none': 'None',
      'alerts.count': 'alert',
      'alerts.empty': 'No emergency alerts right now — all pilgrims are well.',
      'alerts.emptySub': 'A card will appear here the instant any pilgrim confirms he needs help.',
      'alerts.events': "Campaign events today",
      'alerts.eventsSub': 'Medication reminders and drifts from groups',
      'alerts.noEvents': 'No events yet.',
      'alerts.resolved': 'Past closed incidents',
      'alerts.archive': 'Archive',
      'alerts.closed': 'closed',
      'alert.tag': 'Emergency confirmed by the pilgrim',
      'alert.condition': 'Registered conditions',
      'alert.meds': 'Medications',
      'alert.earpiece': 'Earpiece ID',
      'alert.group': 'Group',
      'alert.contact': 'Emergency contact',
      'alert.distance': 'Distance from group',
      'alert.metres': 'metres · Tawaf step',
      'alert.signals': 'Distress signals Sakeenah detected',
      'alert.said': 'Sakeenah said to him:',

      'audio.blocked': '<b>The browser blocked audio autoplay.</b> Press the button to hear Sakeenah; after that audio will play on its own for the rest of the session.',
      'audio.failed': '<b>Could not play audio:</b>',
      'audio.checkMute': '— make sure your device is not muted and the tab is not muted.',
      'audio.play': '▶ Play Sakeenah',
      'audio.replay': 'Replay this reply'
    },

    ar: {
      'brand.name': 'سكينة',
      'brand.tag': 'رفيق صوتي ذكي لحجاج بيت الله',
      'nav.roster': 'لوحة الحملة',
      'nav.agent': 'تطبيق الحاج',
      'nav.alerts': 'التنبيهات الحيّة',

      'agent.title': 'وكيل سكينة الصوتي',
      'agent.sub': 'هذه هي الشاشة التي يسمعها الحاج عبر سماعته. تحدّث إليها بصوتك وستجيبك سكينة بصوتها.',
      'agent.conv': 'المحادثة الصوتية',
      'agent.connected': 'متصل بالخادم',
      'agent.disconnected': 'انقطع الاتصال',
      'agent.pilgrimCard': 'الحاج المسجَّل',
      'agent.sessionState': 'حالة الجلسة',

      'mic.start': 'ابدأ الجلسة',
      'mic.stop': 'إيقاف الجلسة',
      'mic.listening': 'أستمع إليك',
      'mic.thinking': 'لحظة…',
      'mic.speaking': 'سكينة تتحدث',

      'status.initial': 'اضغط الزر لبدء جلسة الحاج والسماح بالميكروفون',
      'status.speakNow': 'تحدّث الآن…',
      'status.started': 'الجلسة بدأت — سكينة سترحّب بك ثم تستمع إليك',
      'status.ended': 'انتهت الجلسة. اضغط لبدء جلسة جديدة.',
      'status.noSpeech': 'لم أسمع شيئاً… تحدّث بصوت أوضح.',
      'status.micBlocked': 'المتصفح منع الميكروفون. اسمح بالوصول ثم أعد المحاولة.',
      'status.noSR': 'التعرف على الصوت يعمل في Chrome. يمكنك استخدام الحقل النصي كبديل.',

      'mic.meterHint': 'مؤشر الصوت — يتحرك عند كلامك',
      'mic.device': 'الميكروفون',
      'mic.silent': 'لا يصل أي صوت من الميكروفون — تحقق من جهاز الإدخال في ويندوز، أو أغلق تطبيقاً آخر يستخدم الميكروفون.',
      'mic.blocked': 'المتصفح منع الميكروفون — اضغط أيقونة القفل بجانب العنوان واسمح بالميكروفون.',
      'mic.failed': 'تعذّر فتح الميكروفون',
      'mic.pick': 'الميكروفون:',

      'text.placeholder': 'أو اكتب ما يقوله الحاج (احتياطي إن تعذّر الميكروفون)…',
      'btn.send': 'إرسال',

      'sim.summary': 'تتبع الموقع · محاكاة العرض أو GPS حقيقي',
      'sim.body': 'الكشف حقيقي في الحالتين: يحسب المسافة بين الحاج ومجموعته، وحين تتجاوز مسافة التنبيه يكتشف الابتعاد تلقائياً ويطلب من سكينة إرشاده للعودة. محاكاة العرض تحرّك الشخصية في مسار معدّ مسبقاً لتستطيع عرضها داخل القاعة، أما GPS الحقيقي فيستخدم موقع هذا الجهاز الفعلي عبر المنطق نفسه.',
      'sim.drift': 'تسريع الابتعاد الآن',
      'sim.return': 'إرجاعه للمجموعة',

      'gps.sim': 'محاكاة العرض',
      'gps.real': 'GPS حقيقي (هذا الجهاز)',
      'gps.anchor': 'ثبّت نقطة المجموعة هنا',
      'gps.threshold': 'مسافة التنبيه',
      'gps.waiting': 'بانتظار إشارة GPS من هذا الجهاز…',
      'gps.denied': 'رُفض إذن الموقع. اسمح بالموقع لهذا الموقع ثم أعد المحاولة.',
      'gps.unsupported': 'هذا المتصفح لا يوفّر خدمة تحديد الموقع.',
      'gps.fix': 'GPS حيّ · الدقة',
      'gps.anchored': 'ثُبّتت نقطة المجموعة عند موقعك الحالي. ابتعد عنها لتشغيل تنبيه الابتعاد.',
      'gps.realNote': 'وضع GPS الحقيقي مفعّل: هذا الجهاز يرسل موقعه الفعلي، ونفس منطق الكشف يعمل عليه. داخل المباني قد تكون الدقة ٢٠ إلى ٥٠ متراً، فاجعل مسافة التنبيه أكبر من ذلك.',
      'state.gpsSim': 'محاكاة',
      'state.gpsReal': 'GPS حيّ',
      'demo.summary': 'مشغّلات العرض · للتسجيل',
      'demo.body': 'مواعيد الأدوية الحقيقية وتتبع GPS الحقيقي يعملان كما هما دون تغيير. هذه الأزرار تُطلق نفس الأحداث التي يطلقها النظام تلقائياً، لتتمكن من تسجيل كل الميزات دون انتظار الساعة ٢٠:٠٠ أو المشي ٨٠ متراً.',
      'demo.med': 'تذكير بالدواء',
      'demo.drift': 'ابتعد عن المجموعة',
      'demo.back': 'عاد إلى المجموعة',
      'demo.fall': 'رصد سقوط',
      'demo.fallNote': 'مستشعر السقوط محاكى — عتاد السماعة لم يُبنَ بعد. وكل ما يلي الرصد حقيقي: سكينة تطمئن عليه، وتسأله قبل أي إنذار، وتنتظر جوابه.',
      'sys.fall': 'سقوط مرصود من مستشعر السماعة',

      'state.step': 'خطوة الطواف',
      'state.distance': 'المسافة عن المجموعة',
      'state.med': 'الدواء القادم',
      'state.distress': 'رصد الضائقة',
      'state.on': 'يعمل',
      'state.awaiting': 'بانتظار التأكيد',
      'state.emergency': 'طارئ مؤكَّد',
      'state.none': 'لا يوجد',
      'state.of': 'من',

      'who.pilgrim': 'الحاج',
      'who.sakeenah': 'سكينة',
      'sys.medication': 'تذكير دواء تلقائي',
      'sys.drift': 'رصد ابتعاد عن المجموعة',
      'sys.driftResolved': 'عاد إلى المجموعة',
      'sys.event': 'حدث من النظام',

      'banner.confirm': '<b>رُصدت إشارة ضائقة في كلام الحاج.</b> سكينة تسأله الآن: «هل تحتاج مساعدة؟» — لن يُرسل أي تنبيه قبل تأكيده.',
      'banner.signals': 'الإشارات:',
      'banner.emergency': '<b>أكّد الحاج حاجته للمساعدة.</b> أُرسل تنبيه حيّ إلى لوحة التنبيهات مع بياناته المسجَّلة، وأُشعرت جهة الطوارئ ورئيس الحملة.',
      'banner.noKey': '<b>تنبيه:</b> مفتاح Gemini غير مضبوط في الخادم. ضع GEMINI_API_KEY في ملف .env ثم أعد تشغيل الخادم.',
      'banner.fallback': '<b>تنبيه للفريق:</b> تعذّر الوصول إلى Gemini، وتعمل سكينة الآن بالخطة الاحتياطية المحلية.',
      'banner.quota': '<b>تنبيه للفريق:</b> نفدت حصة Gemini المجانية لهذا المفتاح، وتعمل سكينة الآن بالخطة الاحتياطية المحلية. العرض يعمل كاملاً رغم ذلك. راجع استهلاكك في ai.dev/rate-limit أو استخدم مفتاحاً ثانياً.',

      'card.name': 'الاسم',
      'card.age': 'العمر',
      'card.years': 'سنة',
      'card.condition': 'الحالة الصحية',
      'card.contact': 'جهة الطوارئ',
      'card.earpiece': 'سماعة',

      'roster.title': 'لوحة الحملة',
      'roster.sub': 'الحجاج المسجَّلون تحت الحملة، وبياناتهم الصحية ومعرّفات سماعاتهم.',
      'roster.tableTitle': 'سجل الحجاج المسجَّلين',
      'roster.count': 'حاج مسجَّل',
      'roster.leader': 'رئيس الحملة:',
      'roster.id': 'رقم الحملة',
      'th.pilgrim': 'الحاج',
      'th.age': 'العمر',
      'th.condition': 'الحالة الصحية',
      'th.meds': 'الأدوية ومواعيدها',
      'th.earpiece': 'معرّف السماعة',
      'th.group': 'المجموعة',
      'th.contact': 'جهة الطوارئ',
      'risk.high': 'خطورة مرتفعة',
      'risk.mid': 'خطورة متوسطة',
      'risk.low': 'عادي',
      'demo.badge': 'حاج العرض',
      'meds.none': 'لا يوجد',

      'alerts.title': 'التنبيهات الحيّة',
      'alerts.sub': 'تصل التنبيهات هنا لحظة تأكيد الحاج حاجته للمساعدة، مسحوبة من بياناته المسجَّلة في لوحة الحملة.',
      'alerts.active': 'تنبيهات طارئة نشطة',
      'alerts.none': 'لا يوجد',
      'alerts.count': 'تنبيه',
      'alerts.empty': 'لا توجد تنبيهات طارئة الآن — جميع حجاج الحملة بخير.',
      'alerts.emptySub': 'ستظهر البطاقة هنا فوراً عند تأكيد أي حاج حاجته للمساعدة.',
      'alerts.events': 'أحداث الحملة اليوم',
      'alerts.eventsSub': 'تذكيرات الأدوية والابتعاد عن المجموعات',
      'alerts.noEvents': 'لا أحداث بعد.',
      'alerts.resolved': 'حوادث سابقة مغلقة',
      'alerts.archive': 'أرشيف',
      'alerts.closed': 'مغلق',
      'alert.tag': 'طارئ صحي مؤكَّد من الحاج',
      'alert.condition': 'الحالة الصحية المسجَّلة',
      'alert.meds': 'الأدوية',
      'alert.earpiece': 'معرّف السماعة',
      'alert.group': 'المجموعة',
      'alert.contact': 'جهة الطوارئ',
      'alert.distance': 'المسافة عن المجموعة',
      'alert.metres': 'متراً · خطوة الطواف',
      'alert.signals': 'إشارات الضائقة التي رصدتها سكينة',
      'alert.said': 'قالت سكينة للحاج:',

      'audio.blocked': '<b>المتصفح منع تشغيل الصوت تلقائياً.</b> اضغط الزر لتشغيل صوت سكينة، وبعدها سيعمل الصوت وحده بقية الجلسة.',
      'audio.failed': '<b>تعذّر تشغيل الصوت:</b>',
      'audio.checkMute': '— تأكد أن صوت الجهاز غير مكتوم وأن التبويب غير مكتوم.',
      'audio.play': '▶ تشغيل صوت سكينة',
      'audio.replay': 'أعد سماع هذا الرد'
    }
  };

  const STORE_KEY = 'sakeenah.lang';

  function saved() {
    try {
      const v = localStorage.getItem(STORE_KEY);
      if (v === 'en' || v === 'ar') return v;
    } catch (_) {}
    return 'en'; // الإنجليزية هي الافتراضية · English is the default
  }

  const I18N = {
    lang: saved(),

    t(key) {
      const d = DICT[this.lang] || DICT.en;
      return d[key] != null ? d[key] : (DICT.en[key] != null ? DICT.en[key] : key);
    },

    /** يختار الحقل بلغة الواجهة · picks the field in the current UI language */
    f(obj, field) {
      if (!obj) return '';
      if (this.lang === 'en' && obj[field + '_en']) return obj[field + '_en'];
      return obj[field] || '';
    },

    set(lang) {
      this.lang = lang === 'ar' ? 'ar' : 'en';
      try { localStorage.setItem(STORE_KEY, this.lang); } catch (_) {}
      this.apply();
      document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: this.lang } }));
    },

    apply() {
      const html = document.documentElement;
      html.lang = this.lang;
      html.dir = this.lang === 'ar' ? 'rtl' : 'ltr';

      document.querySelectorAll('[data-i18n]').forEach((el) => {
        el.textContent = this.t(el.getAttribute('data-i18n'));
      });
      document.querySelectorAll('[data-i18n-html]').forEach((el) => {
        el.innerHTML = this.t(el.getAttribute('data-i18n-html'));
      });
      document.querySelectorAll('[data-i18n-ph]').forEach((el) => {
        el.placeholder = this.t(el.getAttribute('data-i18n-ph'));
      });
      document.querySelectorAll('[data-i18n-title]').forEach((el) => {
        el.title = this.t(el.getAttribute('data-i18n-title'));
      });

      document.querySelectorAll('.lang-btn').forEach((b) => {
        b.classList.toggle('active', b.dataset.lang === this.lang);
      });
      document.title =
        this.lang === 'en'
          ? (document.body.dataset.titleEn || 'Sakeenah')
          : (document.body.dataset.titleAr || 'سكينة');
    },

    mount() {
      const host = document.querySelector('.lang-switch');
      if (host) {
        host.innerHTML =
          '<button type="button" class="lang-btn" data-lang="en">EN</button>' +
          '<button type="button" class="lang-btn" data-lang="ar">ع</button>';
        host.querySelectorAll('.lang-btn').forEach((b) => {
          b.addEventListener('click', () => I18N.set(b.dataset.lang));
        });
      }
      this.apply();
    }
  };

  window.I18N = I18N;
  document.addEventListener('DOMContentLoaded', () => I18N.mount());
})();
