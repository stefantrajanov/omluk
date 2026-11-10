import "server-only";
import { getSupabase } from "@/lib/supabase/server";
import type { Order, OrderItem, OrderStatus } from "@/lib/orders/types";

export class SchemaMissingError extends Error {
  constructor() {
    super("Базата не е поставена. Извршете ја миграцијата 0001_init.sql.");
    this.name = "SchemaMissingError";
  }
}

type PgError = { code?: string; message?: string } | null;

// Missing table (PGRST205 / 42P01) or missing RPC function (PGRST202 / 42883).
export function isSchemaMissing(error: PgError): boolean {
  return !!error && ["PGRST205", "42P01", "PGRST202", "42883"].includes(error.code ?? "");
}

export function throwDbError(error: NonNullable<PgError>): never {
  if (isSchemaMissing(error)) throw new SchemaMissingError();
  throw new Error(error.message ?? "Database error");
}

type ItemRow = {
  id: string;
  product_key: string;
  label: string;
  quantity: number;
  unit_price: number;
  note: string | null;
  position: number;
};

type OrderRow = {
  id: string;
  customer_name: string;
  phone: string | null;
  order_date: string;
  order_time: string;
  notes: string | null;
  status: OrderStatus;
  total: number;
  order_items: ItemRow[] | null;
};

function toOrder(row: OrderRow): Order {
  const items: OrderItem[] = [...(row.order_items ?? [])]
    .sort((a, b) => a.position - b.position)
    .map((i) => ({
      id: i.id,
      productKey: i.product_key,
      label: i.label,
      quantity: i.quantity,
      unitPrice: i.unit_price,
      note: i.note,
    }));
  return {
    id: row.id,
    customerName: row.customer_name,
    phone: row.phone,
    date: row.order_date,
    time: row.order_time.slice(0, 5),
    notes: row.notes,
    status: row.status,
    total: row.total,
    items,
  };
}

export async function getOrdersForDate(date: string): Promise<Order[]> {
  const { data, error } = await getSupabase()
    .from("orders")
    .select(
      "id, customer_name, phone, order_date, order_time, notes, status, total, order_items(id, product_key, label, quantity, unit_price, note, position)",
    )
    .eq("order_date", date)
    .order("order_time", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throwDbError(error);
  return (data as unknown as OrderRow[]).map(toOrder);
}

export async function getOrderCounts(from: string, to: string): Promise<Record<string, number>> {
  // Grouped in SQL so the row limit never truncates a busy month.
  const { data, error } = await getSupabase().rpc("order_counts", { p_from: from, p_to: to });
  if (error) throwDbError(error);
  const counts: Record<string, number> = {};
  for (const row of (data ?? []) as { order_date: string; order_count: number }[]) {
    counts[row.order_date] = row.order_count;
  }
  return counts;
}
