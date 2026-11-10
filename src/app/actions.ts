"use server";

import { isValidISODate } from "@/lib/dates";
import { getOrderCounts } from "@/lib/orders/queries";

const MAX_RANGE_DAYS = 62;

/** Per-day order counts for the calendar drawer's visible month grid. */
export async function getCalendarCountsAction(from: string, to: string): Promise<Record<string, number> | null> {
  if (!isValidISODate(from) || !isValidISODate(to) || from > to) return null;
  const days = (Date.parse(to) - Date.parse(from)) / 86_400_000;
  if (days > MAX_RANGE_DAYS) return null;
  try {
    return await getOrderCounts(from, to);
  } catch {
    return null;
  }
}
