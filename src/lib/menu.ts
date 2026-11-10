export type Size = "large" | "small";
export type Category = "pie" | "eggs_pie" | "pizza" | "bake_only";
export type Meat = "pork" | "chicken";
export type Filling = "eggs" | "cheese" | "cheese_eggs";
// meat + filling only for "pie"
export type ItemSelection = { category: Category; size: Size; meat?: Meat; filling?: Filling };

export const HOURLY_CAPACITY = 17;

export const CATEGORIES: { key: Category; label: string; hint?: string }[] = [
  { key: "pie", label: "Пити" },
  { key: "eggs_pie", label: "Пита со наши јајца", hint: "Носите свое месо" },
  { key: "pizza", label: "Пици", hint: "Видот на пица во белешка" },
  { key: "bake_only", label: "Со се донесено", hint: "Носите се, ние само печеме" },
];

export const SIZES: { key: Size; label: string }[] = [
  { key: "large", label: "Голема" },
  { key: "small", label: "Мала" },
];

export const MEATS: { key: Meat; label: string }[] = [
  { key: "pork", label: "Свинска" },
  { key: "chicken", label: "Пилешка" },
];

export const FILLINGS: { key: Filling; label: string }[] = [
  { key: "eggs", label: "Со јајца" },
  { key: "cheese", label: "Со кашкавал" },
  { key: "cheese_eggs", label: "Со кашкавал и јајца" },
];

const PIE_PRICES: Record<Size, Record<Filling, number>> = {
  large: { eggs: 670, cheese: 750, cheese_eggs: 800 },
  small: { eggs: 350, cheese: 380, cheese_eggs: 400 },
};

const FLAT_PRICES: Record<Exclude<Category, "pie">, Record<Size, number>> = {
  eggs_pie: { large: 400, small: 200 },
  pizza: { large: 700, small: 350 },
  bake_only: { large: 300, small: 150 },
};

const isKey = <T extends string>(list: { key: T }[], v: string | undefined): v is T =>
  v !== undefined && list.some((x) => x.key === v);

export function productKey(sel: ItemSelection): string {
  return sel.category === "pie"
    ? `pie:${sel.size}:${sel.meat}:${sel.filling}`
    : `${sel.category}:${sel.size}`;
}

export function parseProductKey(key: string): ItemSelection | null {
  const [category, size, meat, filling, ...rest] = key.split(":");
  if (rest.length || !isKey(CATEGORIES, category) || !isKey(SIZES, size)) return null;
  if (category === "pie") {
    if (!isKey(MEATS, meat) || !isKey(FILLINGS, filling)) return null;
    return { category, size, meat, filling };
  }
  if (meat !== undefined || filling !== undefined) return null;
  return { category, size };
}

export function unitPrice(sel: ItemSelection): number {
  if (sel.category === "pie") return PIE_PRICES[sel.size][sel.filling ?? "eggs"];
  return FLAT_PRICES[sel.category][sel.size];
}

export function itemLabel(sel: ItemSelection): string {
  const size = sel.size === "large" ? "Голема" : "Мала";
  switch (sel.category) {
    case "pie": {
      const meat = sel.meat === "pork" ? "свинска" : "пилешка";
      const filling = FILLINGS.find((f) => f.key === sel.filling)?.label.toLowerCase() ?? "";
      return `${size} пита ${meat} ${filling}`.trim();
    }
    case "eggs_pie":
      return `${size} пита со наши јајца`;
    case "pizza":
      return `${size} пица`;
    case "bake_only":
      return `${size} пита – со се донесено`;
  }
}
