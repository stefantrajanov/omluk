import {
  addDays,
  endOfMonth,
  format,
  isValid,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { mk } from "date-fns/locale/mk";

export const TIME_ZONE = "Europe/Skopje";
export const SLOT_MINUTES = [0, 15, 30, 45] as const;
export const OPEN_HOUR = 6;
export const CLOSE_HOUR = 22; // last hour block is 21:00–22:00

const pad = (n: number) => String(n).padStart(2, "0");

const skopjeFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function skopjeNow() {
  const parts: Record<string, string> = {};
  for (const p of skopjeFormatter.formatToParts(new Date())) parts[p.type] = p.value;
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    hour: Number(parts.hour) % 24,
    minute: Number(parts.minute),
  };
}

export function todayISO(): string {
  return skopjeNow().date;
}

export function nowHM(): { hour: number; minute: number } {
  const { hour, minute } = skopjeNow();
  return { hour, minute };
}

export type ShopClock = { date: string; minutes: number };

/** Shop-local date and minutes since midnight. */
export function shopNow(): ShopClock {
  const { date, hour, minute } = skopjeNow();
  return { date, minutes: hour * 60 + minute };
}

const SLOT_LENGTH = 15;

/** Earliest bookable slot start (minutes) on `date`; null when the whole day is past. */
export function firstOpenMinute(date: string, now: ShopClock): number | null {
  if (date < now.date) return null;
  if (date > now.date) return 0;
  return Math.floor(now.minutes / SLOT_LENGTH) * SLOT_LENGTH;
}

/** Slot's 15-minute window has fully ended at `now`. */
export function isPastSlotAt(date: string, time: string, now: ShopClock): boolean {
  if (date !== now.date) return date < now.date;
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m + SLOT_LENGTH <= now.minutes;
}

/** Slot's 15-minute window has fully ended (Europe/Skopje). */
export function isPastSlot(date: string, time: string): boolean {
  return isPastSlotAt(date, time, shopNow());
}

export function nextSlot(): { date: string; time: string } {
  const { date, hour, minute } = skopjeNow();
  const total = hour * 60 + Math.ceil((minute + 1) / 15) * 15;
  if (total >= 24 * 60) return { date: addDaysISO(date, 1), time: "00:00" };
  return { date, time: formatHM(Math.floor(total / 60), total % 60) };
}

export function isValidISODate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = parseISODate(s);
  return isValid(d) && toISODate(d) === s;
}

export function parseISODate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function addDaysISO(date: string, days: number): string {
  return toISODate(addDays(parseISODate(date), days));
}

export function weekDates(date: string): string[] {
  const monday = startOfWeek(parseISODate(date), { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => toISODate(addDays(monday, i)));
}

export function monthRange(date: string): { from: string; to: string } {
  const d = parseISODate(date);
  return { from: toISODate(startOfMonth(d)), to: toISODate(endOfMonth(d)) };
}

export function formatLongDate(date: string): string {
  return format(parseISODate(date), "EEEE, d MMMM", { locale: mk });
}

export function formatWeekdayShort(date: string): string {
  return format(parseISODate(date), "EEE", { locale: mk });
}

export function formatHM(hour: number, minute: number): string {
  return `${pad(hour)}:${pad(minute)}`;
}

export function hourWindowLabel(hour: number): string {
  return `${formatHM(hour, 0)} – ${formatHM((hour + 1) % 24, 0)}`;
}
