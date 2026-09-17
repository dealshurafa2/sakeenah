// خطوات نسك الطواف — سبعة أشواط · Tawaf, seven circuits
// كل خطوة قصيرة بما يكفي لتُقال صوتياً في جملة أو جملتين.

const TAWAF_STEPS = [
  {
    id: 0,
    title: 'النية والاستعداد',
    title_en: 'Intention and preparation',
    guidance:
      'نبدأ بالنية من القلب لطواف القدوم، ونتأكد أنك على طهارة، وأن الكتف الأيمن مكشوف إن كنت محرماً. خذ نفساً عميقاً، ولا تستعجل.',
    guidance_en:
      'We begin with the intention in your heart for the arrival Tawaf. Make sure you are in a state of purity, and that your right shoulder is uncovered if you are in ihram. Take a deep breath. There is no hurry.'
  },
  {
    id: 1,
    title: 'محاذاة الحجر الأسود',
    title_en: 'Aligning with the Black Stone',
    guidance:
      'اتجه إلى ركن الحجر الأسود، وحين تحاذيه أشر إليه بيدك اليمنى وقل: بسم الله والله أكبر. لا تزاحم أحداً من أجل تقبيله، الإشارة تكفي.',
    guidance_en:
      'Walk toward the corner of the Black Stone. When you are level with it, raise your right hand toward it and say: Bismillah, Allahu Akbar. Please do not push through the crowd to kiss it. Pointing is enough.'
  },
  {
    id: 2,
    title: 'الشوط الأول والثاني',
    title_en: 'First and second circuits',
    guidance:
      'اجعل الكعبة عن يسارك وابدأ المشي. هذا هو الشوط الأول. ادعُ بما تحب بلغتك، فلا يوجد دعاء محدد واجب. سأعدّ معك الأشواط.',
    guidance_en:
      'Keep the Kaaba on your left side and begin walking. This is your first circuit. Pray in your own words, in your own language. There is no required supplication. I will count the circuits with you.'
  },
  {
    id: 3,
    title: 'الشوط الثالث والرابع',
    title_en: 'Third and fourth circuits',
    guidance:
      'أنت الآن في منتصف الطواف. إن شعرت بتعب، تحرك نحو الأطراف حيث الزحام أخف، واشرب ماء زمزم إن كان قريباً منك.',
    guidance_en:
      'You are halfway through now. If you feel tired, move toward the outer edge where the crowd is lighter, and drink some Zamzam water if it is near you.'
  },
  {
    id: 4,
    title: 'الشوط الخامس والسادس',
    title_en: 'Fifth and sixth circuits',
    guidance:
      'بقي شوطان بعد هذين. بين الركن اليماني والحجر الأسود قل: ربنا آتنا في الدنيا حسنة وفي الآخرة حسنة وقنا عذاب النار.',
    guidance_en:
      'Two more circuits after these. Between the Yemeni corner and the Black Stone, say: Our Lord, give us good in this world and good in the next, and protect us from the fire.'
  },
  {
    id: 5,
    title: 'الشوط السابع والأخير',
    title_en: 'The seventh and final circuit',
    guidance: 'هذا آخر شوط، أحسنت يا حاج. أكمله بهدوء وأنت تحاذي الحجر الأسود للمرة الأخيرة.',
    guidance_en:
      'This is your last circuit. You have done well. Finish it calmly, passing the Black Stone one final time.'
  },
  {
    id: 6,
    title: 'ركعتا الطواف',
    title_en: 'The two units of prayer',
    guidance:
      'انتهى طوافك، تقبل الله منك. اتجه الآن خلف مقام إبراهيم إن تيسر لك، وصلِّ ركعتين خفيفتين. إن كان الزحام شديداً فصلِّ في أي مكان من المسجد.',
    guidance_en:
      'Your Tawaf is complete. May it be accepted. Now move behind the Station of Ibrahim if you can reach it, and pray two short units. If it is too crowded, you may pray anywhere in the mosque.'
  }
];

function stepsForPrompt(lang) {
  if (lang === 'en') {
    return TAWAF_STEPS.map((s) => `${s.id}. ${s.title_en}: ${s.guidance_en}`).join('\n');
  }
  return TAWAF_STEPS.map((s) => `${s.id}. ${s.title}: ${s.guidance}`).join('\n');
}

function stepTitle(i, lang) {
  const s = TAWAF_STEPS[i];
  if (!s) return lang === 'en' ? 'unknown' : 'غير محددة';
  return lang === 'en' ? s.title_en : s.title;
}

module.exports = { TAWAF_STEPS, stepsForPrompt, stepTitle };
