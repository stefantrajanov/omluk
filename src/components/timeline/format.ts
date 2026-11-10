import type { OrderItem } from "@/lib/orders/types";

/** Macedonian plural: 1 нарачка, 2 нарачки; 21 парче, 22 парчиња. */
export function pluralize(count: number, one: string, many: string): string {
  return count % 10 === 1 && count % 100 !== 11 ? one : many;
}

export function lowerFirst(text: string): string {
  return text.charAt(0).toLocaleLowerCase("mk") + text.slice(1);
}

/** e.g. "2× голема пита пилешка со кашкавал (пеперони)" */
export function summarizeItem(item: Pick<OrderItem, "quantity" | "label" | "note">): string {
  const note = item.note ? ` (${item.note})` : "";
  return `${item.quantity}× ${lowerFirst(item.label)}${note}`;
}

/** "13:15" -> minutes since midnight. */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}
