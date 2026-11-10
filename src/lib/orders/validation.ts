import "server-only";
import { z } from "zod";
import { isValidISODate } from "@/lib/dates";
import { itemLabel, parseProductKey, unitPrice } from "@/lib/menu";
import type { OrderInput } from "@/lib/orders/types";

const optionalText = z
  .string()
  .nullish()
  .transform((v) => (v?.trim() ? v.trim() : null));

const itemSchema = z.object({
  productKey: z.string().refine((k) => parseProductKey(k) !== null, "Непознат производ."),
  quantity: z
    .number({ error: "Количината мора да е број." })
    .int("Количината мора да е цел број.")
    .min(1, "Количината мора да е најмалку 1.")
    .max(99, "Количината може да е најмногу 99."),
  note: optionalText,
});

const orderSchema = z.object({
  customerName: z
    .string({ error: "Внесете име на купувачот." })
    .trim()
    .min(1, "Внесете име на купувачот.")
    .max(120, "Името е предолго."),
  phone: optionalText,
  date: z.string().refine(isValidISODate, "Невалиден датум."),
  time: z
    .string()
    .regex(/^([01]\d|2[0-3]):(00|15|30|45)$/, "Времето мора да е на 15 минути (пр. 13:15)."),
  notes: optionalText,
  items: z
    .array(itemSchema, { error: "Додадете барем еден производ." })
    .min(1, "Додадете барем еден производ.")
    .max(50, "Премногу ставки."),
});

export type SavePayload = {
  order: {
    customer_name: string;
    phone: string | null;
    order_date: string;
    order_time: string;
    notes: string | null;
    total: number;
  };
  items: { product_key: string; label: string; quantity: number; unit_price: number; note: string | null }[];
};

// Prices and labels are always recomputed from the menu, never taken from the client.
export function buildSavePayload(
  input: OrderInput,
): { ok: true; payload: SavePayload } | { ok: false; error: string } {
  const parsed = orderSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Невалидни податоци." };
  }
  const v = parsed.data;
  const items = v.items.map((item) => {
    const sel = parseProductKey(item.productKey)!;
    return {
      product_key: item.productKey,
      label: itemLabel(sel),
      quantity: item.quantity,
      unit_price: unitPrice(sel),
      note: item.note,
    };
  });
  const total = items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);
  return {
    ok: true,
    payload: {
      order: {
        customer_name: v.customerName,
        phone: v.phone,
        order_date: v.date,
        order_time: v.time,
        notes: v.notes,
        total,
      },
      items,
    },
  };
}
