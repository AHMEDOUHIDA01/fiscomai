import type { Tr } from "../types";

export type ShopItemId = "hearts" | "freeze" | "chechia" | "tarbouche" | "djellaba" | "nador";

export interface ShopItem {
  id: ShopItemId;
  kind: "hearts" | "freeze" | "outfit";
  price: number;
  icon: string;
  title: Tr;
  description: Tr;
}

export const SHOP: ShopItem[] = [
  {
    id: "hearts", kind: "hearts", price: 350, icon: "❤️",
    title: { ar: "ملء القلوب", darija: "عمّر القلوب", fr: "Recharge des cœurs" },
    description: { ar: "استعد كل قلوبك الآن", darija: "رجّع گاع القلوب دابا", fr: "Retrouve tous tes cœurs maintenant" },
  },
  {
    id: "freeze", kind: "freeze", price: 200, icon: "🧊",
    title: { ar: "حماية السلسلة", darija: "حماية السلسلة", fr: "Protection de série" },
    description: { ar: "تحمي سلسلتك يومًا واحدًا (2 كحد أقصى)", darija: "كتحمي السلسلة نهار واحد (2 ماكسيموم)", fr: "Protège ta série un jour manqué (2 max)" },
  },
  {
    id: "chechia", kind: "outfit", price: 300, icon: "🧢",
    title: { ar: "شاشية", darija: "شاشية", fr: "Chéchia" },
    description: { ar: "قبعة حمراء أنيقة لأوكيكو", darija: "شاشية حمرا لأوكيكو", fr: "Une chéchia rouge pour Okiko" },
  },
  {
    id: "tarbouche", kind: "outfit", price: 400, icon: "🎩",
    title: { ar: "طربوش فاسي", darija: "طربوش فاسي", fr: "Tarbouche fassi" },
    description: { ar: "طربوش أحمر بشرّابة سوداء", darija: "طربوش حمر بالشرّابة", fr: "Le tarbouche rouge à pompon noir" },
  },
  {
    id: "djellaba", kind: "outfit", price: 500, icon: "🧥",
    title: { ar: "جلابة", darija: "جلابة", fr: "Djellaba" },
    description: { ar: "جلابة زرقاء ماجوريل", darija: "جلابة زرقا ماجوريل", fr: "Une djellaba bleu Majorelle" },
  },
  {
    id: "nador", kind: "outfit", price: 250, icon: "🕶️",
    title: { ar: "نظارات شمسية", darija: "نظاظر ديال الشمس", fr: "Lunettes de soleil" },
    description: { ar: "لأيام الصيف في أكادير", darija: "لصيف أكادير", fr: "Pour l'été à Agadir" },
  },
];

export const shopItem = (id: ShopItemId) => SHOP.find((i) => i.id === id)!;
