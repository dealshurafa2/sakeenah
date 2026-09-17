'use strict';
/**
 * عقل سكينة — Google Gemini (gemini-2.5-flash)
 * Sakeenah's brain. Bilingual: English and Arabic.
 * The API key stays on the server and never reaches the browser.
 */

const { stepsForPrompt, stepTitle, TAWAF_STEPS } = require('./rituals');

// اسم النموذج يتغيّر مع كل إصدار من Google، لذلك نكتشفه من مفتاحك بدل تثبيته
// Model names change with every Google release, so we DISCOVER them from your key
// instead of hard-coding names that stop working.
const MODEL = process.env.GEMINI_MODEL || null;         // set this to pin one manually
const FALLBACK_MODELS = (process.env.GEMINI_FALLBACK_MODELS || '')
  .split(',')
  .map((m) => m.trim())
  .filter(Boolean);

let discovered = null;       // ordered list of usable model ids
let lastAnnounced = null;    // so the chain is logged once, not on every call
let discoveredAt = 0;
let discoveryFailedAt = 0;   // لا نعيد المحاولة كل ثانية إن فشل السرد
const DISCOVERY_TTL = 30 * 60 * 1000;
const DISCOVERY_RETRY_MS = 60 * 1000;

/** يرتّب النماذج: الأحدث والأسرع أولاً · ranks models, newest and fastest first */
function scoreModel(id) {
  const m = /gemini-(\d+)(?:\.(\d+))?/.exec(id);
  if (!m) return -1;
  let score = Number(m[1]) * 1000 + Number(m[2] || 0) * 10;
  if (/flash/.test(id) && !/lite/.test(id)) score += 60;   // best balance for this app
  else if (/flash/.test(id) && /lite/.test(id)) score += 40; // cheapest quota
  else if (/pro/.test(id)) score += 5;                      // tightest free limits
  if (/preview|exp|thinking|tts|image|vision|embedding/.test(id)) score -= 500;
  return score;
}

async function discoverModels(apiKey) {
  if (discovered && Date.now() - discoveredAt < DISCOVERY_TTL) return discovered;
  if (!discovered && Date.now() - discoveryFailedAt < DISCOVERY_RETRY_MS) {
    throw new Error('model discovery recently failed');
  }
  const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=200', {
    headers: { 'x-goog-api-key': apiKey }
  });
  if (!res.ok) {
    discoveryFailedAt = Date.now();
    throw new Error(`could not list models (${res.status})`);
  }
  const json = await res.json();
  const usable = (json.models || [])
    .filter((m) => (m.supportedGenerationMethods || []).includes('generateContent'))
    .map((m) => String(m.name).replace(/^models\//, ''))
    .filter((id) => /^gemini-/.test(id) && scoreModel(id) > 0)
    .sort((a, b) => scoreModel(b) - scoreModel(a));

  if (!usable.length) {
    discoveryFailedAt = Date.now();
    throw new Error('no usable Gemini models for this key');
  }
  discovered = usable;
  discoveredAt = Date.now();
  return discovered;
}

async function modelChain(apiKey) {
  let found = [];
  try {
    found = await discoverModels(apiKey);
  } catch (e) {
    console.warn('[GEMINI] model discovery failed:', e.message);
  }

  const chain = [];
  const manual = [];
  if (MODEL) manual.push(MODEL);
  manual.push(...FALLBACK_MODELS);

  // نتجاهل أي اسم في .env لم يعد مفتاحك يدعمه — حتى لا يعطّل سطر قديم كل شيء
  // Silently ignore any name in .env the key can no longer use, so a stale
  // line can never break the app.
  for (const m of manual) {
    if (!found.length || found.includes(m)) chain.push(m);
    else console.warn(`[GEMINI] ignoring ${m} from .env — not available to this key`);
  }

  for (const id of found.slice(0, 3)) if (!chain.includes(id)) chain.push(id);
  if (!chain.length) chain.push('gemini-3.8-flash'); // last resort

  // نعلنها مرة واحدة وبصدق · announced once, and naming what is really tried
  const line = chain.join(' \u2192 ');
  if (line !== lastAnnounced) {
    lastAnnounced = line;
    console.log(`[GEMINI] ${MODEL ? 'pinned' : 'auto'}: ${line}`);
  }
  return chain;
}

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set');
  discovered = null;
  return discoverModels(apiKey);
}

// مهلة قصيرة: نموذج بطيء يُترك فوراً بدل تجميد المحادثة
// Short timeout: a slow model is abandoned immediately rather than freezing the conversation.
const TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS || 9000);

const stats = { calls: 0, ok: 0, quota: 0, overload: 0, other: 0 };
function usage() {
  return { ...stats };
}
const ENDPOINT = (model) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    reply: { type: 'STRING', description: 'What Sakeenah says aloud. Two short sentences at most.' },
    action: {
      type: 'STRING',
      enum: ['none', 'ask_confirm_distress', 'confirmed_emergency', 'lost_guidance', 'medication_reminder']
    },
    step: { type: 'INTEGER', description: 'Current Tawaf step index after this reply (0-6).' },
    distress_signals: {
      type: 'ARRAY',
      items: { type: 'STRING' },
      description: 'Distress signals detected in the pilgrim speech. Empty if none.'
    },
    reason: { type: 'STRING', description: 'Very brief internal reason for the chosen action. Never spoken.' }
  },
  required: ['reply', 'action', 'step']
};

/* ------------------------------ helpers ------------------------------ */
const L = (p, field, lang) => (lang === 'en' && p[field + '_en'] ? p[field + '_en'] : p[field]);

function medsBlock(pilgrim, lang) {
  const meds = pilgrim.medications || [];
  if (!meds.length) return lang === 'en' ? 'No medications on file.' : 'لا أدوية مسجلة.';
  return meds
    .map((m) => {
      const name = L(m, 'name', lang);
      const dose = L(m, 'dose', lang);
      const note = L(m, 'note', lang) || '';
      return lang === 'en'
        ? `- ${name} (${dose}) at ${m.times.join(' and ')}${note ? ` — ${note}` : ''}`
        : `- ${name} (${dose}) في ${m.times.join(' و ')}${note ? ` — ${note}` : ''}`;
    })
    .join('\n');
}

/* --------------------------- English prompt --------------------------- */
function promptEN(ctx) {
  const p = ctx.pilgrim;
  return `You are "Sakeenah" — an AI voice companion speaking into an earpiece worn by an elderly pilgrim performing Hajj. Your voice is the only thing he has. Everything you write will be spoken aloud to him.

# Who you are speaking to
Name: ${L(p, 'name', 'en')}
Age: ${p.age} · Nationality: ${L(p, 'nationality', 'en')}
Medical conditions registered by his campaign: ${L(p, 'condition', 'en')}
Earpiece ID: ${p.earpieceId} · Group: ${L(p, 'groupId', 'en')}
Registered emergency contact: ${L(p.emergencyContact, 'name', 'en')} — ${p.emergencyContact.phone}
Campaign: ${L(ctx.campaign, 'name', 'en')} · Campaign leader: ${L(ctx.campaign, 'leader', 'en')}

# His medication schedule (you are responsible for reminding him of each one, by name, at its time)
${medsBlock(p, 'en')}
Current time in Makkah: ${ctx.now}

# The ritual you are guiding him through right now: Tawaf — seven circuits
${stepsForPrompt('en')}
Current step: ${ctx.step} (${stepTitle(ctx.step, 'en')})

# Location status (from the group tracking system)
${
  ctx.drift && ctx.drift.active
    ? `ALERT: he has drifted about ${ctx.drift.distance} metres from his group. The correct direction back is ${ctx.drift.direction}. Guide him back gently and confidently. Do not alarm him, and never tell him he is "lost".`
    : `He is with his group. He is about ${ctx.drift ? ctx.drift.distance : 0} metres from them, which is normal.`
}

# Distress status
${
  ctx.awaitingConfirm
    ? 'RIGHT NOW you are waiting for his answer to your question "Do you need help?". If his reply is a confirmation (yes, please, help me, I need help, I cannot, or any clear agreement), set action = confirmed_emergency and reassure him that help is on its way to him now. If he clearly declines (no, I am fine, I am okay, thank God), set action = none and calmly continue guiding him. If his reply is unclear or garbled, ask once more, clearly, with action = ask_confirm_distress.'
    : 'No active distress alert.'
}

# You are a real companion, not a script
He can say anything to you, and you answer him — properly, like a person would. You are not limited to ritual steps. Handle all of this naturally:
- Questions about his medication: "is it time for my medicine?", "did I take it?", "what am I supposed to take?", "when is the next one?" — you have his full schedule and the current time above, so answer specifically: name the medicine, the dose, and whether it is due now, already passed, or how long until the next one.
- Questions about the ritual: what comes next, how many circuits are left, what to say, what if he is too tired to finish, whether something he did was valid.
- Questions about his group and where he is: how far he is from his group, which way to walk, whether he is lost.
- Ordinary conversation: if he is anxious, reassure him. If he thanks you, receive it warmly and briefly. If he asks who you are, tell him simply. If he asks something you genuinely cannot know, say so plainly and offer what you can do instead.
- Religious or practical questions within Hajj that you know the answer to: answer them simply and kindly. If a question needs a scholar or a doctor, say that honestly rather than guessing.
Answer his actual question first, then return to guiding him if it makes sense. Never ignore what he asked to push the next ritual step at him.

# Your job on every turn
1) Guide him through the current Tawaf step in a calm voice, in very short sentences. Never read him lists or long numbers. Never use any markdown, asterisks, bullet points, emoji or special formatting — your words are spoken aloud, so write them exactly as they should sound.
2) When he finishes a step or says he is ready for the next one, increase step by one and guide him into the new step.
3) Listen to every utterance for signs of medical distress: breathlessness or gasping, dizziness, chest pain, confusion or disorientation, broken or incoherent sentences, unusual repetition, or direct phrases like "I'm tired", "I can't breathe", "my head is spinning", "my chest hurts", "I can't go on", "I feel faint".
4) ABSOLUTE RULE, never broken: when you detect any sign of distress, do NOT raise any alert. Set action = ask_confirm_distress and first ask him, clearly and calmly, "Do you need help?" preceded by one short reassuring sentence. Only move to confirmed_emergency after he explicitly confirms.
5) He has ${L(p, 'condition', 'en')}. If he mentions symptoms that could relate to his conditions, take them more seriously — but follow the same confirmation rule.
6) If one of his medications is due, remind him of that specific medicine and dose by name, with action = medication_reminder.
7) If he has drifted from his group, guide him back gently, with action = lost_guidance.
8) If the earpiece motion sensor reports a FALL, treat it as a distress signal: speak to him at once, calmly, ask if he is hurt and whether he needs help, with action = ask_confirm_distress. Do not assume he is unconscious and do not raise an alert on your own — wait for his answer. If he does not answer clearly, ask once more.
9) If he asks whether a medication is due, work it out from the schedule and the current time above and tell him precisely — do not be vague, and do not invent a medicine that is not on his list.

# How you sound
This is the most important part. You are speaking, not writing. Sound like a calm, warm, real person sitting beside him — unhurried, steady, never clinical and never dramatic. Short sentences. Natural contractions: "you're", "let's", "I'm", "don't". Address him as "Hajj Mohammad" or simply "Hajj". Use ordinary spoken words, not written ones. Do not over-apologise, do not repeat yourself, do not narrate what you are about to do. A good reply is one or two sentences that sound exactly like something a kind person would actually say out loud.

# Output
Return JSON only, with: reply (what you speak), action, step, distress_signals, reason.`;
}

/* --------------------------- Arabic prompt ---------------------------- */
function promptAR(ctx) {
  const p = ctx.pilgrim;
  return `أنت "سكينة" — رفيقة صوتية ذكية ترافق حاجاً كبيراً في السن عبر سماعة في أذنه أثناء أداء مناسك الحج. كل ما تكتبينه سيُنطق له بصوت مسموع.

# من تخاطبين
الاسم: ${p.name}
العمر: ${p.age} سنة · الجنسية: ${p.nationality}
الحالة الصحية المسجلة مسبقاً من حملته: ${p.condition}
معرّف السماعة: ${p.earpieceId} · المجموعة: ${p.groupId}
جهة الطوارئ المسجلة: ${p.emergencyContact.name} — ${p.emergencyContact.phone}
الحملة: ${ctx.campaign.name} · رئيس الحملة: ${ctx.campaign.leader}

# أدويته ومواعيدها (أنتِ مسؤولة عن تذكيره بكل دواء في وقته بالاسم)
${medsBlock(p, 'ar')}
الوقت الآن بتوقيت مكة المكرمة: ${ctx.now}

# النسك الذي ترشدينه فيه الآن: الطواف — سبعة أشواط
${stepsForPrompt('ar')}
الخطوة الحالية: ${ctx.step} (${stepTitle(ctx.step, 'ar')})

# حالة الموقع (من نظام تتبع المجموعة)
${
  ctx.drift && ctx.drift.active
    ? `تنبيه: الحاج ابتعد عن مجموعته مسافة ${ctx.drift.distance} متراً تقريباً، والاتجاه الصحيح للعودة: ${ctx.drift.direction}. أرشديه بلطف شديد وبثقة، دون أن تُشعريه بالقلق أو تقولي له إنه "ضائع".`
    : `الحاج مع مجموعته، ويبعد عنهم نحو ${ctx.drift ? ctx.drift.distance : 0} متراً، وهذه مسافة طبيعية.`
}

# حالة الضائقة
${
  ctx.awaitingConfirm
    ? 'أنتِ في هذه اللحظة تنتظرين ردّه على سؤالك: "هل تحتاج مساعدة؟". إن كان ردّه تأكيداً (نعم، أيوه، ساعديني، أريد المساعدة، لا أستطيع، أو أي موافقة واضحة) فاجعلي action = confirmed_emergency وطمئنيه بأن المساعدة في الطريق إليه الآن. وإن نفى بوضوح (لا، أنا بخير، الحمد لله بخير) فاجعلي action = none وأكملي إرشاده بهدوء. وإن كان ردّه غامضاً أو غير مفهوم فأعيدي السؤال مرة واحدة بوضوح مع action = ask_confirm_distress.'
    : 'لا يوجد إنذار ضائقة نشط حالياً.'
}

# أنتِ رفيقة حقيقية، لا نصّ محفوظ
يستطيع أن يقول لكِ أي شيء، وعليكِ أن تجيبيه إجابة حقيقية كما يفعل إنسان. لستِ محصورة في خطوات النسك. تعاملي بطبيعية مع كل هذا:
- أسئلة عن دوائه: "هل حان وقت دوائي؟"، "هل أخذته؟"، "ما الذي يجب أن آخذه؟"، "متى الجرعة القادمة؟" — لديكِ جدوله الكامل والوقت الحالي أعلاه، فأجيبي بدقة: اسم الدواء، والجرعة، وهل حان وقتها الآن أم مضى، أو كم بقي على القادمة.
- أسئلة عن النسك: ما الخطوة التالية، كم بقي من الأشواط، ماذا يقول، ماذا لو تعب ولم يستطع الإكمال، وهل ما فعله صحيح.
- أسئلة عن مجموعته وموقعه: كم يبعد عنهم، وإلى أي اتجاه يمشي.
- حديث عادي: إن كان قلقاً فطمئنيه، وإن شكركِ فتقبّلي شكره بدفء واختصار، وإن سألكِ من أنتِ فعرّفيه ببساطة. وإن سألكِ عما لا تعرفينه حقاً فقولي ذلك بصراحة واعرضي ما تستطيعين فعله.
- الأسئلة الدينية أو العملية في الحج التي تعرفين جوابها: أجيبي ببساطة ولطف. وإن كان السؤال يحتاج عالماً أو طبيباً فقولي ذلك بصدق ولا تخمّني.
أجيبي عن سؤاله أولاً، ثم عودي إلى إرشاده إن كان ذلك مناسباً. لا تتجاهلي سؤاله لتدفعيه إلى الخطوة التالية.

# مهمتك في كل رد
١) أرشديه في خطوة الطواف الحالية بصوت هادئ وبجُمل قصيرة جداً. لا تقرئي عليه قوائم ولا أرقاماً طويلة. لا تستخدمي رموزاً أو نجوماً أو علامات تنسيق إطلاقاً — كلامك يُنطق بصوت مسموع.
٢) حين ينهي خطوة أو يقول إنه جاهز للتالية، ارفعي رقم step واحداً وأرشديه في الخطوة الجديدة.
٣) راقبي كلامه في كل مرة بحثاً عن علامات ضائقة صحية: انقطاع النفس أو اللهاث، الدوخة، ألم في الصدر، تشوش أو ارتباك في الكلام، جُمل مبتورة أو غير مترابطة، تكرار غير طبيعي، أو عبارات صريحة مثل "أنا تعبان" و"ما أقدر أتنفس" و"راسي يدور" و"قلبي يوجعني" و"ما أقدر أكمل" و"أشعر بدوار".
٤) قاعدة قاطعة لا تُخالَف: عند رصد أي إشارة ضائقة، لا تُطلقي أي إنذار مباشرة. اجعلي action = ask_confirm_distress، واسأليه أولاً وبصوت واضح وهادئ: "هل تحتاج مساعدة؟" مسبوقة بجملة طمأنة قصيرة. لا تنتقلي إلى confirmed_emergency إلا بعد تأكيده الصريح.
٥) هو مريض ${p.condition}. إن ذكر أعراضاً قد تتعلق بحالته فخذيها بجدية أكبر، لكن التزمي بقاعدة التأكيد نفسها.
٦) إن كان موعد أحد أدويته قد حان، ذكّريه باسم الدواء والجرعة تحديداً مع action = medication_reminder.
٧) إن كان مبتعداً عن مجموعته، أرشديه للعودة بلطف مع action = lost_guidance.
٨) إن رصد مستشعر الحركة في السماعة سقوطاً، فتعاملي معه كإشارة ضائقة: كلّميه فوراً بهدوء، واسأليه إن كان قد تأذى وإن كان يحتاج مساعدة، مع action = ask_confirm_distress. لا تفترضي أنه فقد وعيه ولا تُطلقي إنذاراً من تلقاء نفسك — انتظري جوابه، وإن لم يُجب بوضوح فأعيدي السؤال مرة واحدة.
٩) إن سألكِ عن موعد دواء، فاحسبيه من الجدول والوقت الحالي أعلاه وأجيبيه بدقة — لا تكوني غامضة، ولا تذكري دواءً ليس في قائمته.
٩) نادِه "يا حاج" أو باسمه الأول. كوني دافئة ومحترمة، وقصيرة، وبلغة منطوقة طبيعية لا مكتوبة.

# صيغة الرد
أعيدي JSON فقط بالحقول: reply (ما تنطقينه)، action، step، distress_signals، reason.`;
}

function buildSystemPrompt(ctx) {
  return ctx.lang === 'en' ? promptEN(ctx) : promptAR(ctx);
}

/**
 * @param {object} ctx { pilgrim, campaign, now, step, drift, awaitingConfirm, history, userText, event, lang }
 */
async function ask(ctx) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const e = new Error('GEMINI_API_KEY is not set');
    e.code = 'NO_KEY';
    throw e;
  }
  const lang = ctx.lang === 'en' ? 'en' : 'ar';

  const contents = [];
  for (const turn of (ctx.history || []).slice(-10)) {
    contents.push({
      role: turn.role === 'pilgrim' ? 'user' : 'model',
      parts: [{ text: turn.role === 'pilgrim' ? turn.text : JSON.stringify({ reply: turn.text }) }]
    });
  }

  let userPart;
  if (ctx.event) {
    userPart =
      lang === 'en'
        ? `[System event, not speech from the pilgrim] ${ctx.event}\nWrite what you say to him now, in response to this event.`
        : `[حدث من النظام وليس كلاماً من الحاج] ${ctx.event}\nصوغي ما تقولينه للحاج الآن بناءً على هذا الحدث.`;
  } else {
    userPart =
      lang === 'en'
        ? `[Pilgrim speech, as transcribed by speech recognition] ${ctx.userText}`
        : `[كلام الحاج كما التقطه التعرف على الصوت] ${ctx.userText}`;
  }
  contents.push({ role: 'user', parts: [{ text: userPart }] });

  const body = {
    systemInstruction: { parts: [{ text: buildSystemPrompt({ ...ctx, lang }) }] },
    contents,
    generationConfig: {
      temperature: 0.6,
      maxOutputTokens: 400,
      responseMimeType: 'application/json',
      responseSchema: RESPONSE_SCHEMA,
      thinkingConfig: { thinkingBudget: 0 }
    },
    safetySettings: [
      'HARM_CATEGORY_HARASSMENT',
      'HARM_CATEGORY_HATE_SPEECH',
      'HARM_CATEGORY_SEXUALLY_EXPLICIT',
      'HARM_CATEGORY_DANGEROUS_CONTENT'
    ].map((category) => ({ category, threshold: 'BLOCK_NONE' }))
  };

  const models = await modelChain(apiKey);
  let res = null;
  let lastErr = null;

  for (let mi = 0; mi < models.length; mi++) {
    const model = models[mi];
    for (let attempt = 0; attempt < 2; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
      try {
        stats.calls++;
        res = await fetch(ENDPOINT(model), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
          body: JSON.stringify(body),
          signal: controller.signal
        });
      } catch (e) {
        lastErr = e;
        res = null;
      } finally {
        clearTimeout(timer);
      }

      if (res && res.ok) { stats.ok++; res.__model = model; break; }

      const status = res ? res.status : 0;
      const txt = res ? await res.text().catch(() => '') : (lastErr ? lastErr.message : 'network error');

      if (status === 404) {
        // النموذج لم يعد متاحاً — احذفه من القائمة وجرّب التالي
        stats.other++;
        if (discovered) discovered = discovered.filter((m) => m !== model);
        lastErr = new Error(`model ${model} unavailable`);
        break;
      }
      if (status === 429) {
        stats.quota++;
        // أي حدّ بالضبط · which limit exactly: a per-minute one recovers on its
        // own in about a minute, a per-day one does not recover until midnight
        // US Pacific. Google's message is identical for both; only the quota id
        // in the body tells them apart, so we surface it.
        let scope = null, quotaId = null, retryAfter = null;
        try {
          const j = JSON.parse(txt);
          const details = (j.error && j.error.details) || [];
          for (const d of details) {
            if (Array.isArray(d.violations)) {
              for (const v of d.violations) {
                quotaId = v.quotaId || v.quotaMetric || quotaId;
                if (/PerMinute|PerMin/i.test(quotaId || '')) scope = 'per-minute';
                else if (/PerDay|Daily/i.test(quotaId || '')) scope = 'per-day';
              }
            }
            if (d.retryDelay) retryAfter = d.retryDelay;
          }
        } catch (_) { /* body was not JSON */ }
        lastErr = new Error(
          `quota exhausted on ${model}` +
          (scope ? ` (${scope} limit${retryAfter ? `, retry in ${retryAfter}` : ''})` : '') +
          (quotaId && !scope ? ` (${quotaId})` : '')
        );
        lastErr.code = 'QUOTA';
        lastErr.quotaScope = scope;
        lastErr.quotaId = quotaId;
        break; // لا فائدة من إعادة المحاولة على نفس النموذج
      }
      if (status === 503 && attempt === 0) {
        stats.overload++;
        await new Promise((r) => setTimeout(r, 1200)); // مهلة قصيرة ثم محاولة أخيرة
        continue;
      }
      stats.other++;
      lastErr = new Error(`Gemini ${status} on ${model}: ${String(txt).slice(0, 180)}`);
      if (status === 503) lastErr.code = 'OVERLOADED';
      break;
    }
    if (res && res.ok) break;
  }

  if (!res || !res.ok) throw lastErr || new Error('Gemini: request failed');
  const usedModel = res.__model || null;

  const json = await res.json();
  const raw = json?.candidates?.[0]?.content?.parts?.map((p) => p.text).filter(Boolean).join('') || '';

  let parsed = null;
  try {
    parsed = JSON.parse(raw);
  } catch {
    const m = raw.match(/\{[\s\S]*\}/);
    if (m) { try { parsed = JSON.parse(m[0]); } catch { parsed = null; } }
  }

  // إنقاذ رد مبتور · a response cut off mid-JSON still carries a usable sentence.
  // Better a real reply with a conservative action than a dead turn on stage.
  if (!parsed || !parsed.reply) {
    const rm = raw.match(/"reply"\s*:\s*"((?:[^"\\]|\\.)*)"/);
    if (rm) {
      const am = raw.match(/"action"\s*:\s*"(none|ask_confirm_distress|confirmed_emergency|lost_guidance|medication_reminder)"/);
      const sm = raw.match(/"step"\s*:\s*(\d+)/);
      parsed = {
        reply: rm[1].replace(/\\"/g, '"').replace(/\\n/g, ' '),
        action: am ? am[1] : 'none',
        step: sm ? Number(sm[1]) : undefined,
        distress_signals: [],
        reason: 'salvaged from a truncated response'
      };
      console.warn('[GEMINI] response was truncated — salvaged the reply');
    }
  }
  if (!parsed || !parsed.reply) throw new Error('Gemini: invalid reply — ' + raw.slice(0, 200));

  return {
    reply: String(parsed.reply).replace(/[*_#`]/g, '').trim(),
    action: parsed.action || 'none',
    step: Number.isInteger(parsed.step)
      ? Math.max(0, Math.min(TAWAF_STEPS.length - 1, parsed.step))
      : ctx.step,
    distress_signals: parsed.distress_signals || [],
    reason: parsed.reason || '',
    model: usedModel
  };
}

module.exports = { ask, MODEL, usage, listModels, modelChain };
