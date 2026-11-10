import type { Order } from "@/lib/orders/types";

export function orderPieces(order: Pick<Order, "items">): number {
  return order.items.reduce((sum, item) => sum + item.quantity, 0);
}

export function hourlyLoad(orders: Order[]): Record<number, number> {
  const load: Record<number, number> = {};
  for (const order of orders) {
    const hour = Number(order.time.slice(0, 2));
    load[hour] = (load[hour] ?? 0) + orderPieces(order);
  }
  return load;
}

export function formatPrice(amount: number): string {
  // Manual grouping keeps server and client output identical.
  const digits = String(Math.round(Math.abs(amount))).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${amount < 0 ? "-" : ""}${digits} ден.`;
}
