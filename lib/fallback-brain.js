'use strict';
/**
 * خطة احتياطية فقط — لا تعمل إلا إذا ضبطت FALLBACK_BRAIN=1 في .env
 *
 * الغرض: لو انقطع الإنترنت أو تعطّل Gemini في ليلة العرض، يبقى المسار الصوتي
 * كاملاً يعمل أمام المحكّمين بمنطق محلي بسيط (بدون ذكاء حقيقي).
 * الافتراضي أنها مطفأة، حتى لا يظن أحد أن Gemini يعمل وهو معطّل.
 */

const { TAWAF_STEPS } = require('./rituals');

const DISTRESS = [
  'تعبان', 'تعبانة', 'ما أقدر', 'لا أستطيع', 'أتنفس', 'نفسي', 'دايخ', 'دوخة', 'دوار',
  'راسي', 'قلبي', 'صدري', 'ألم', 'يوجعني', 'وجع', 'حر', 'عطشان', 'أغمى', 'مرهق',
  'ما أعرف وين', 'ضايع', 'تايه'
];

const CONFIRM = ['نعم', 'ايوه', 'أيوه', 'أجل', 'اي', 'إي', 'ساعدني', 'ساعديني', 'أحتاج', 'احتاج', 'المساعدة', 'بسرعة', 'الحقوني'];
const DENY = ['لا', 'بخير', 'الحمد لله', 'ما في شي', 'تمام', 'كويس', 'ما أحتاج'];

const has = (t, list) => list.some((w) => t.includes(w));

const EN_DISTRESS = ['tired', "can't breathe", 'cant breathe', 'breathe', 'dizzy', 'chest', 'hurts', 'pain', 'faint', 'exhausted', 'lost', 'help'];
const EN_CONFIRM = ['yes', 'yeah', 'please', 'help me', 'i need', 'need help'];
const EN_DENY = ['no', "i'm fine", 'im fine', 'okay', "i'm okay", 'all good'];

function askEN(ctx) {
  const t = (ctx.userText || '').toLowerCase().trim();
  const name = (ctx.pilgrim.name_en || 'Hajj').split(' ')[1] || 'Hajj';
  let step = ctx.step;

  if (ctx.event) {
    if (/medication/i.test(ctx.event)) {
      const m = ctx.pilgrim.medications[0];
      return { reply: `Hajj ${name}, it's time for your ${m.name_en}, ${m.dose_en}. Take it with a little water, there's no rush.`, action: 'medication_reminder', step, distress_signals: [], reason: 'fallback' };
    }
    if (/drifted/i.test(ctx.event)) {
      return { reply: `Hajj ${name}, everything's fine, don't worry. Your group is just a little way ${ctx.drift.directionEn || 'ahead'} of you. Walk slowly that way and I'm with you.`, action: 'lost_guidance', step, distress_signals: [], reason: 'fallback' };
    }
    if (/fall/i.test(ctx.event)) {
      return { reply: "Hajj Mohammad, I felt that. Are you hurt? Stay still for a moment and tell me — do you need help?", action: 'ask_confirm_distress', step, distress_signals: ['fall detected by earpiece sensor'], reason: 'fallback: fall' };
    }
    if (/rejoined/i.test(ctx.event)) {
      return { reply: "Well done, you're back with your group. Let's carry on with your Tawaf.", action: 'none', step, distress_signals: [], reason: 'fallback' };
    }
    return { reply: `Peace be upon you, Hajj ${name}. I'm Sakeenah, and I'll be with you through your Tawaf, step by step. ${TAWAF_STEPS[0].guidance_en} Are you ready?`, action: 'none', step: 0, distress_signals: [], reason: 'fallback' };
  }

  if (ctx.awaitingConfirm) {
    if (has(t, EN_CONFIRM)) {
      return { reply: "All right, Hajj. Help is on the way to you now, and I've told your campaign leader and your emergency contact. Stay where you are, and sit down if you can.", action: 'confirmed_emergency', step, distress_signals: ['explicit confirmation'], reason: 'fallback' };
    }
    if (has(t, EN_DENY)) {
      return { reply: "I'm glad you're all right. Let's carry on slowly, and I'm here if you need me.", action: 'none', step, distress_signals: [], reason: 'fallback' };
    }
    return { reply: "I didn't catch that, Hajj. Do you need help? Just say yes or no.", action: 'ask_confirm_distress', step, distress_signals: [], reason: 'fallback' };
  }

  if (has(t, EN_DISTRESS)) {
    return { reply: "Take it easy, Hajj. Breathe slowly, I'm right here with you. Do you need help?", action: 'ask_confirm_distress', step, distress_signals: EN_DISTRESS.filter((w) => t.includes(w)), reason: 'fallback: distress words' };
  }

  if (/ready|done|finished|next|okay|yes/.test(t)) step = Math.min(TAWAF_STEPS.length - 1, step + 1);
  return { reply: TAWAF_STEPS[step].guidance_en, action: 'none', step, distress_signals: [], reason: 'fallback' };
}

function ask(ctx) {
  if (ctx.lang === 'en') return askEN(ctx);
  const t = (ctx.userText || '').trim();
  const name = ctx.pilgrim.name.split(' ')[1] || 'حاج';
  let step = ctx.step;

  if (ctx.event) {
    if (/دواء|موعد/.test(ctx.event)) {
      const m = ctx.pilgrim.medications[0];
      return {
        reply: `يا ${name}، حان الآن موعد دواء ${m.name} جرعة ${m.dose}. خذه مع قليل من الماء ولا تستعجل.`,
        action: 'medication_reminder', step, distress_signals: [], reason: 'fallback'
      };
    }
    if (/ابتعد/.test(ctx.event)) {
      return {
        reply: `يا ${name}، لا تقلق أبداً، كل شيء بخير. مجموعتك قريبة منك جهة ${ctx.drift.direction}. امشِ بهدوء في هذا الاتجاه وأنا معك خطوة بخطوة.`,
        action: 'lost_guidance', step, distress_signals: [], reason: 'fallback'
      };
    }
    if (/سقوط/.test(ctx.event)) {
      return {
        reply: 'يا حاج محمد، شعرتُ بسقوطك. هل أنت بخير؟ ابقَ مكانك قليلاً وقل لي: هل تحتاج مساعدة؟',
        action: 'ask_confirm_distress', step,
        distress_signals: ['سقوط مرصود من مستشعر السماعة'], reason: 'fallback: سقوط'
      };
    }
    if (/عاد الحاج/.test(ctx.event)) {
      return { reply: 'أحسنت يا حاج، عدت إلى مجموعتك. لنكمل طوافك بهدوء.', action: 'none', step, distress_signals: [], reason: 'fallback' };
    }
    return {
      reply: `السلام عليكم يا ${name}، أنا سكينة رفيقتك في الحج. سأرشدك في الطواف خطوة بخطوة. ${TAWAF_STEPS[0].guidance} هل أنت جاهز؟`,
      action: 'none', step: 0, distress_signals: [], reason: 'fallback'
    };
  }

  if (ctx.awaitingConfirm) {
    if (has(t, CONFIRM)) {
      return {
        reply: 'حسناً يا حاج، اطمئن. طلبت المساعدة لك الآن، وأبلغت رئيس حملتك وجهة الطوارئ. ابقَ مكانك واجلس إن استطعت، المساعدة في طريقها إليك.',
        action: 'confirmed_emergency', step, distress_signals: ['تأكيد صريح من الحاج'], reason: 'fallback'
      };
    }
    if (has(t, DENY)) {
      return { reply: 'الحمد لله على سلامتك. لنكمل بهدوء، وأنا معك إن احتجت شيئاً.', action: 'none', step, distress_signals: [], reason: 'fallback' };
    }
    return { reply: 'لم أسمعك جيداً يا حاج. هل تحتاج مساعدة؟ قل نعم أو لا.', action: 'ask_confirm_distress', step, distress_signals: [], reason: 'fallback' };
  }

  if (has(t, DISTRESS)) {
    return {
      reply: 'اهدأ يا حاج، خذ نفساً عميقاً وأنا معك. هل تحتاج مساعدة؟',
      action: 'ask_confirm_distress', step,
      distress_signals: DISTRESS.filter((w) => t.includes(w)),
      reason: 'fallback: كلمات ضائقة'
    };
  }

  if (/جاهز|تمام|خلصت|انتهيت|كمل|التالي|نعم/.test(t)) step = Math.min(TAWAF_STEPS.length - 1, step + 1);
  return { reply: TAWAF_STEPS[step].guidance, action: 'none', step, distress_signals: [], reason: 'fallback' };
}

module.exports = { ask };
