"use server";

import { revalidatePath } from "next/cache";
import { getSupabase } from "@/lib/supabase/server";
import { isValidISODate } from "@/lib/dates";
import { isSchemaMissing, SchemaMissingError } from "@/lib/orders/queries";
import { buildSavePayload } from "@/lib/orders/validation";
import type { ActionResult, OrderInput, OrderStatus } from "@/lib/orders/types";

const MSG_SCHEMA = new SchemaMissingError().message;
const MSG_NOT_FOUND = "Нарачката не постои или е избришана.";
const MSG_GENERIC = "Настана грешка при зачувување. Обидете се повторно.";

const isUuid = (s: unknown): s is string =>
  typeof s === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

function fail(error: { code?: string; message?: string }): { ok: false; error: string } {
  if (isSchemaMissing(error)) return { ok: false, error: MSG_SCHEMA };
  if (error.code === "P0002") return { ok: false, error: MSG_NOT_FOUND };
  console.error("[orders]", error);
  return { ok: false, error: MSG_GENERIC };
}

async function saveOrder(id: string | null, input: OrderInput): Promise<ActionResult<{ id: string }>> {
  const built = buildSavePayload(input);
  if (!built.ok) return built;
  try {
    const { data, error } = await getSupabase().rpc("save_order", {
      p_id: id,
      p_order: built.payload.order,
      p_items: built.payload.items,
    });
    if (error) return fail(error);
    revalidatePath("/");
    return { ok: true, data: { id: data as string } };
  } catch (e) {
    return fail(e as Error);
  }
}

export async function createOrder(input: OrderInput): Promise<ActionResult<{ id: string }>> {
  return saveOrder(null, input);
}

export async function updateOrder(id: string, input: OrderInput): Promise<ActionResult> {
  if (!isUuid(id)) return { ok: false, error: MSG_NOT_FOUND };
  const res = await saveOrder(id, input);
  return res.ok ? { ok: true, data: undefined } : res;
}

export async function setOrderStatus(id: string, status: OrderStatus): Promise<ActionResult> {
  if (!isUuid(id)) return { ok: false, error: MSG_NOT_FOUND };
  if (status !== "pending" && status !== "done") return { ok: false, error: "Невалиден статус." };
  try {
    const { data, error } = await getSupabase()
      .from("orders")
      .update({ status })
      .eq("id", id)
      .select("id");
    if (error) return fail(error);
    if (!data?.length) return { ok: false, error: MSG_NOT_FOUND };
    revalidatePath("/");
    return { ok: true, data: undefined };
  } catch (e) {
    return fail(e as Error);
  }
}

export async function deleteOrder(id: string): Promise<ActionResult> {
  if (!isUuid(id)) return { ok: false, error: MSG_NOT_FOUND };
  try {
    const { error } = await getSupabase().from("orders").delete().eq("id", id);
    if (error) return fail(error);
    revalidatePath("/");
    return { ok: true, data: undefined };
  } catch (e) {
    return fail(e as Error);
  }
}

// Pieces per hour (0-23) for a day; capacity is a soft limit, so this never fails loudly.
export async function getHourlyLoad(date: string, excludeOrderId?: string): Promise<Record<number, number>> {
  if (!isValidISODate(date)) return {};
  let rows: { order_time: string; order_items: { quantity: number }[] | null }[] = [];
  try {
    let query = getSupabase().from("orders").select("id, order_time, order_items(quantity)").eq("order_date", date);
    if (excludeOrderId && isUuid(excludeOrderId)) query = query.neq("id", excludeOrderId);
    const { data, error } = await query;
    if (error) {
      if (!isSchemaMissing(error)) console.error("[orders] hourly load", error);
      return {};
    }
    rows = (data ?? []) as typeof rows;
  } catch (e) {
    console.error("[orders] hourly load", e);
    return {};
  }
  const load: Record<number, number> = {};
  for (const row of rows) {
    const hour = Number(row.order_time.slice(0, 2));
    const pieces = (row.order_items ?? []).reduce((s, i) => s + i.quantity, 0);
    load[hour] = (load[hour] ?? 0) + pieces;
  }
  return load;
}
