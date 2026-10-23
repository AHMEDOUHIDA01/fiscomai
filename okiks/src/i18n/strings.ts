import type { Tr, UiLang } from "../engine/types";

/** Textes de l'interface. `{x}` est remplacé par la variable du même nom. */
const S = {
  appTagline: ["تعلّم الإنجليزية على الطريقة المغربية", "تعلّم النگليزية بالمغربي", "Apprends l'anglais à la marocaine"],
  chooseLang: ["اختر لغة التطبيق", "ختار اللغة ديال التطبيق", "Choisis la langue de l'application"],
  whoAreYou: ["من سيتعلم؟", "شكون غادي يتعلم؟", "Qui va apprendre ?"],
  profileKids: ["طفل", "دري صغير", "Enfant"],
  profileKidsDesc: ["6–12 سنة · صور، ألعاب، بدون ضغط", "6–12 عام · تصاور، لعب، بلا ضغط", "6–12 ans · images, jeux, sans pression"],
  profileAdult: ["بالغ", "كبير", "Adulte"],
  profileAdultDesc: ["الحياة اليومية والسفر", "الحياة د كل نهار والسفر", "Vie quotidienne et voyages"],
  profilePro: ["مهني", "بروفيسيونيل", "Professionnel"],
  profileProDesc: ["البريد، الاجتماعات، المقابلات", "الإيمايلات، الاجتماعات، الأونتروفيو", "E-mails, réunions, entretiens"],
  dailyGoalTitle: ["ما هو هدفك اليومي؟", "شنو هو الهدف ديالك كل نهار؟", "Quel est ton objectif quotidien ?"],
  goalCasual: ["خفيف", "على خاطرك", "Tranquille"],
  goalRegular: ["منتظم", "منتاضم", "Régulier"],
  goalSerious: ["جاد", "جدّي", "Sérieux"],
  goalIntense: ["مكثف", "واعر", "Intense"],
  xpPerDay: ["{n} نقطة يوميًا", "{n} نقطة فالنهار", "{n} XP par jour"],
  start: ["ابدأ", "يالاه نبداو", "Commencer"],
  continue: ["متابعة", "كمّل", "Continuer"],
  check: ["تحقق", "شوف", "Vérifier"],
  skip: ["تخطي", "دوز", "Passer"],
  cantListen: ["لا أستطيع الاستماع الآن", "ما نقدرش نسمع دابا", "Je ne peux pas écouter maintenant"],
  cantSpeak: ["لا أستطيع التحدث الآن", "ما نقدرش نهضر دابا", "Je ne peux pas parler maintenant"],
  correct: ["ممتاز!", "مزيان بزاف!", "Excellent !"],
  correctAlt: ["أحسنت!", "تبارك الله عليك!", "Bravo !"],
  typoTitle: ["صحيح، لكن انتبه للكتابة", "صحيح، ولكن رد البال للكتابة", "Correct, mais attention à l'orthographe"],
  wrongTitle: ["الجواب الصحيح:", "الجواب الصحيح:", "Bonne réponse :"],
  meaning: ["المعنى:", "المعنى:", "Sens :"],
  // Consignes
  exSelectImage: ["اختر الصورة الصحيحة", "ختار التصويرة الصحيحة", "Choisis la bonne image"],
  exNewWord: ["كلمة جديدة!", "كلمة جديدة!", "Nouveau mot !"],
  exTranslateToEnglish: ["اكتب هذا بالإنجليزية", "كتب هادي بالنگليزية", "Écris ceci en anglais"],
  exTranslateToNative: ["ترجم هذه الجملة", "ترجم هاد الجملة", "Traduis cette phrase"],
  exListenType: ["اكتب ما تسمعه", "كتب داكشي لي سمعتي", "Écris ce que tu entends"],
  exFillBlank: ["أكمل الجملة", "كمّل الجملة", "Complète la phrase"],
  exMatchPairs: ["اربط الأزواج", "جمع الأزواج", "Associe les paires"],
  exListenOrder: ["رتّب ما تسمعه", "رتّب داكشي لي سمعتي", "Remets dans l'ordre ce que tu entends"],
  exSpeak: ["قل هذه الجملة", "گول هاد الجملة", "Dis cette phrase"],
  exListenTrueFalse: ["هل الصورة تطابق ما تسمعه؟", "واش التصويرة هي داكشي لي سمعتي؟", "L'image correspond-elle à ce que tu entends ?"],
  typeInEnglish: ["اكتب بالإنجليزية", "كتب بالنگليزية", "Écris en anglais"],
  useKeyboard: ["استعمل لوحة المفاتيح", "خدم بالكلافيي", "Utiliser le clavier"],
  useTiles: ["استعمل الكلمات", "خدم بالكلمات", "Utiliser les mots"],
  tapToSpeak: ["اضغط وتكلم", "ضغط وهضر", "Appuie et parle"],
  listening: ["أستمع…", "كنسمع…", "J'écoute…"],
  youSaid: ["قلت:", "گلتي:", "Tu as dit :"],
  yes: ["نعم", "إيه", "Oui"],
  no: ["لا", "لا", "Non"],
  slow: ["ببطء", "بشوية", "Lentement"],
  // Fin de leçon
  lessonComplete: ["أكملت الدرس!", "كملتي الدرس!", "Leçon terminée !"],
  perfectLesson: ["درس بدون أخطاء!", "درس بلا حتى غلطة!", "Leçon parfaite !"],
  totalXp: ["مجموع النقاط", "النقاط", "XP gagnés"],
  accuracy: ["الدقة", "الصحة", "Précision"],
  time: ["الوقت", "الوقت", "Temps"],
  morningBonus: ["تحدي الصباح ×2", "تحدي الصباح ×2", "Défi du matin ×2"],
  comboBonus: ["سلسلة إجابات صحيحة +5", "سلسلة د الأجوبة الصحيحة +5", "Série de bonnes réponses +5"],
  streakUp: ["سلسلتك: {n} يوم!", "السلسلة ديالك: {n} نهار!", "Ta série : {n} jour(s) !"],
  unitChest: ["صندوق الوحدة: +{n} جوهرة", "صندوق الوحدة: +{n} جوهرة", "Coffre de l'unité : +{n} gemmes"],
  newAchievement: ["إنجاز جديد!", "إنجاز جديد!", "Nouveau succès !"],
  quitTitle: ["هل تريد التوقف؟", "واش بغيتي تحبس؟", "Tu veux arrêter ?"],
  quitBody: ["ستفقد تقدمك في هذا الدرس.", "غادي تضيّع داكشي لي درتي فهاد الدرس.", "Tu perdras ta progression dans cette leçon."],
  keepLearning: ["أكمل التعلم", "كمّل التعلم", "Continuer à apprendre"],
  quit: ["توقف", "حبس", "Arrêter"],
  // Cœurs
  noHearts: ["نفدت قلوبك!", "سالاو ليك القلوب!", "Tu n'as plus de cœurs !"],
  noHeartsBody: ["تمرّن لاستعادة قلب، أو انتظر.", "دير مراجعة باش ترجع قلب، ولا تسنى.", "Fais une révision pour regagner un cœur, ou attends."],
  nextHeartIn: ["القلب التالي بعد {t}", "القلب الجاي من دابا {t}", "Prochain cœur dans {t}"],
  refillHearts: ["ملء القلوب ({n} 💎)", "عمّر القلوب ({n} 💎)", "Recharger ({n} 💎)"],
  practiceToEarn: ["تمرّن لكسب قلب", "دير مراجعة وربح قلب", "Réviser pour gagner un cœur"],
  // Accueil
  section: ["القسم {n}", "القسم {n}", "Section {n}"],
  unit: ["الوحدة {n}", "الوحدة {n}", "Unité {n}"],
  level: ["المستوى {n} من {m}", "المستوى {n} من {m}", "Niveau {n} sur {m}"],
  startLesson: ["ابدأ +{n} نقطة", "بدا +{n} نقطة", "Commencer +{n} XP"],
  locked: ["مقفل", "مسدود", "Verrouillé"],
  lockedHint: ["أكمل المستويات السابقة أولًا", "كمّل المستويات اللي قبل", "Termine d'abord les niveaux précédents"],
  unitDone: ["أكملت هذه الوحدة! يمكنك المراجعة.", "كملتي هاد الوحدة! تقدر تراجع.", "Unité terminée ! Tu peux réviser."],
  review: ["مراجعة", "مراجعة", "Réviser"],
  mistakesReview: ["مراجعة الأخطاء", "مراجعة الغلطات", "Revoir mes erreurs"],
  practice: ["تمرين عام", "تمرين عام", "Entraînement général"],
  dailyGoal: ["الهدف اليومي", "الهدف د النهار", "Objectif du jour"],
  // Navigation
  navLearn: ["تعلّم", "تعلّم", "Apprendre"],
  navLeague: ["الدوري", "الدوري", "Ligue"],
  navQuests: ["المهام", "المهام", "Quêtes"],
  navShop: ["المتجر", "الحانوت", "Boutique"],
  navProfile: ["الملف", "البروفيل", "Profil"],
  // Ligue
  leagueTitle: ["دوري {name}", "دوري {name}", "Ligue {name}"],
  leagueEnds: ["ينتهي بعد {t}", "كيسالي من دابا {t}", "Se termine dans {t}"],
  promotionZone: ["منطقة الصعود", "منطقة الطلوع", "Zone de promotion"],
  demotionZone: ["منطقة النزول", "منطقة الهبوط", "Zone de relégation"],
  leagueDisabled: ["الدوري متوقف لهذا الملف.", "الدوري مطفي فهاد البروفيل.", "La ligue est désactivée pour ce profil."],
  enableLeague: ["تفعيل الدوري", "شعّل الدوري", "Activer la ligue"],
  leaguePromoted: ["صعدت إلى دوري {name}!", "طلعتي لدوري {name}!", "Tu montes en ligue {name} !"],
  leagueDemoted: ["نزلت إلى دوري {name}.", "نزلتي لدوري {name}.", "Tu descends en ligue {name}."],
  leagueStayed: ["بقيت في دوري {name} (المركز {n}).", "بقيتي فدوري {name} (المرتبة {n}).", "Tu restes en ligue {name} ({n}ᵉ)."],
  you: ["أنت", "نتا", "Toi"],
  // Quêtes
  questsTitle: ["مهام اليوم", "المهام د اليوم", "Quêtes du jour"],
  questXp: ["اكسب {n} نقطة", "ربح {n} نقطة", "Gagne {n} XP"],
  questLessons: ["أكمل {n} دروس", "كمّل {n} دروس", "Termine {n} leçons"],
  questPerfect: ["أكمل {n} درسًا بلا أخطاء", "كمّل {n} درس بلا غلطة", "Fais {n} leçon(s) parfaite(s)"],
  questListen: ["{n} إجابات صحيحة في الاستماع", "{n} أجوبة صحيحة فالسمع", "{n} bonnes réponses à l'écoute"],
  questCombo: ["{n} إجابات صحيحة متتالية", "{n} أجوبة صحيحة متابعين", "{n} bonnes réponses d'affilée"],
  questCorrect: ["{n} إجابة صحيحة", "{n} جواب صحيح", "{n} bonnes réponses"],
  questsReset: ["مهام جديدة بعد {t}", "مهام جداد من دابا {t}", "Nouvelles quêtes dans {t}"],
  // Boutique
  shopTitle: ["المتجر", "الحانوت", "Boutique"],
  buy: ["شراء", "شري", "Acheter"],
  owned: ["تملكه", "عندك", "Possédé"],
  equip: ["ارتداء", "لبس", "Porter"],
  equipped: ["مرتدى", "لابسو", "Porté"],
  notEnoughGems: ["لا تملك ما يكفي من الجواهر", "ما عندكش الجواهر اللي كافيين", "Pas assez de gemmes"],
  shopKidsLocked: ["القلوب والحماية غير متاحة في ملف الطفل.", "القلوب والحماية ماكايناش فبروفيل الدري.", "Cœurs et protections ne sont pas proposés dans le profil enfant."],
  freezesOwned: ["لديك {n} من 2", "عندك {n} من 2", "Tu en as {n} sur 2"],
  outfits: ["ملابس أوكيكو", "حوايج أوكيكو", "Tenues d'Okiko"],
  // Profil
  profileTitle: ["ملفي", "البروفيل ديالي", "Mon profil"],
  streak: ["السلسلة", "السلسلة", "Série"],
  longestStreak: ["أطول سلسلة", "أطول سلسلة", "Record"],
  totalXpLabel: ["مجموع النقاط", "گاع النقاط", "XP total"],
  wordsLearned: ["كلمات مكتسبة", "كلمات تعلمتيها", "Mots appris"],
  lessons: ["دروس", "دروس", "Leçons"],
  achievements: ["الإنجازات", "الإنجازات", "Succès"],
  thisWeek: ["هذا الأسبوع", "هاد السيمانة", "Cette semaine"],
  settings: ["الإعدادات", "الإعدادات", "Réglages"],
  // Réglages
  uiLanguage: ["لغة التطبيق", "اللغة د التطبيق", "Langue de l'application"],
  learnerProfile: ["ملف المتعلم", "البروفيل د المتعلم", "Profil d'apprentissage"],
  slowAudio: ["صوت بطيء", "صوت بشوية", "Voix ralentie"],
  soundEffects: ["المؤثرات الصوتية", "الأصوات", "Effets sonores"],
  listeningExercises: ["تمارين الاستماع", "تمارين السمع", "Exercices d'écoute"],
  speakingExercises: ["تمارين النطق", "تمارين الهضرة", "Exercices de prononciation"],
  reduceMotion: ["تقليل الحركة", "نقص الحركة", "Réduire les animations"],
  leagueSetting: ["المشاركة في الدوري", "شارك فالدوري", "Participer à la ligue"],
  theme: ["المظهر", "الشكل", "Apparence"],
  themeAuto: ["تلقائي", "أوطوماتيك", "Automatique"],
  themeLight: ["فاتح", "فاتح", "Clair"],
  themeDark: ["ليل الصحراء", "ليل الصحرا", "Nuit du désert"],
  parental: ["المراقبة الأبوية", "المراقبة د الوالدين", "Contrôle parental"],
  dailyLimit: ["الحد اليومي", "الحد د النهار", "Limite quotidienne"],
  unlimited: ["بدون حد", "بلا حد", "Illimité"],
  minutes: ["{n} دقيقة", "{n} دقيقة", "{n} min"],
  timeUp: ["انتهى وقت اليوم!", "سالا الوقت د اليوم!", "C'est fini pour aujourd'hui !"],
  timeUpBody: ["أحسنت! نلتقي غدًا مع أوكيكو.", "تبارك الله عليك! نتلاقاو غدا مع أوكيكو.", "Bravo ! On se retrouve demain avec Okiko."],
  resetProgress: ["مسح كل التقدم", "مسح گاع التقدم", "Effacer toute la progression"],
  resetConfirm: ["هل أنت متأكد؟ لا يمكن التراجع.", "متأكد؟ ما تقدرش ترجع.", "Tu es sûr ? C'est irréversible."],
  offline: ["أنت غير متصل — يمكنك متابعة التعلم.", "ما كاينش الأنترنيت — تقدر تكمّل تتعلم.", "Hors ligne — tu peux continuer à apprendre."],
  madeIn: ["صُنع في المغرب 🇲🇦", "مصنوع فالمغرب 🇲🇦", "Fabriqué au Maroc 🇲🇦"],
  back: ["رجوع", "رجع", "Retour"],
  close: ["إغلاق", "سد", "Fermer"],
  gems: ["جواهر", "جواهر", "gemmes"],
  hearts: ["قلوب", "قلوب", "cœurs"],
  speechUnsupported: ["متصفحك لا يدعم التعرف على الصوت.", "البراوزر ديالك ما كيفهمش الصوت.", "Ton navigateur ne gère pas la reconnaissance vocale."],
} as const satisfies Record<string, readonly [string, string, string]>;

export type StringKey = keyof typeof S;

const LANG_INDEX: Record<UiLang, 0 | 1 | 2> = { ar: 0, darija: 1, fr: 2 };

export function translate(lang: UiLang, key: StringKey, vars?: Record<string, string | number>): string {
  let s: string = S[key][LANG_INDEX[lang]];
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
  return s;
}

export const pickTr = (lang: UiLang, t: Tr) => t[lang];

export const dirOf = (lang: UiLang): "rtl" | "ltr" => (lang === "fr" ? "ltr" : "rtl");

export const LANG_LABEL: Record<UiLang, string> = { ar: "العربية", darija: "الدارجة", fr: "Français" };

/** Durée lisible : « 2 h 15 », « 12 min ». */
export function formatDuration(lang: UiLang, ms: number): string {
  const totalMin = Math.max(1, Math.ceil(ms / 60_000));
  const d = Math.floor(totalMin / 1440);
  const h = Math.floor((totalMin % 1440) / 60);
  const m = totalMin % 60;
  const u = lang === "fr" ? { d: "j", h: "h", m: "min" } : { d: "ي", h: "س", m: "د" };
  if (d > 0) return `${d} ${u.d} ${h} ${u.h}`;
  if (h > 0) return `${h} ${u.h} ${m} ${u.m}`;
  return `${m} ${u.m}`;
}
