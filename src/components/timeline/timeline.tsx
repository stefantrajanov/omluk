"use client";

import { CalendarPlusIcon, PlusIcon } from "lucide-react";
import { Fragment, useEffect, useRef, type CSSProperties } from "react";
import { hourlyLoad } from "@/lib/capacity";
import { CLOSE_HOUR, OPEN_HOUR, SLOT_MINUTES, formatHM, hourWindowLabel } from "@/lib/dates";
import type { Order } from "@/lib/orders/types";
import { cn } from "@/lib/utils";
import { CapacityBar, CapacityPill } from "./capacity-meter";
import { OrderCard } from "./order-card";
import { timeToMinutes } from "./format";

type Props = {
  date: string;
  orders: Order[];
  /** Shop-local minutes since midnight when `date` is today, else null. */
  nowMinutes: number | null;
  onOpenOrder: (order: Order) => void;
  onAddAt: (time: string) => void;
};

type SlotGroup = { minutes: number; time: string; orders: Order[] };

/** Working hours, extended to include any order outside them. */
function visibleHours(orders: Order[]): number[] {
  let start = OPEN_HOUR;
  let end = CLOSE_HOUR;
  for (const order of orders) {
    const hour = Math.floor(timeToMinutes(order.time) / 60);
    start = Math.min(start, hour);
    end = Math.max(end, hour + 1);
  }
  return Array.from({ length: end - start }, (_, i) => start + i);
}

/** Orders grouped by exact time, per hour, in time order. */
function groupByHour(orders: Order[]): Map<number, SlotGroup[]> {
  const byTime = new Map<string, Order[]>();
  for (const order of orders) byTime.set(order.time, [...(byTime.get(order.time) ?? []), order]);

  const byHour = new Map<number, SlotGroup[]>();
  const times = [...byTime.keys()].sort((a, b) => timeToMinutes(a) - timeToMinutes(b));
  for (const time of times) {
    const minutes = timeToMinutes(time);
    const hour = Math.floor(minutes / 60);
    byHour.set(hour, [...(byHour.get(hour) ?? []), { minutes, time, orders: byTime.get(time)! }]);
  }
  return byHour;
}

/** Slot for a quick add in an empty hour: next slot from now in the current hour, else :00. */
function quickAddSlot(hour: number, nowMinutes: number | null): string {
  if (nowMinutes !== null && Math.floor(nowMinutes / 60) === hour) {
    const next = SLOT_MINUTES.find((m) => hour * 60 + m >= nowMinutes);
    if (next !== undefined) return formatHM(hour, next);
  }
  return formatHM(hour, 0);
}

export function Timeline({ date, orders, nowMinutes, onOpenOrder, onAddAt }: Props) {
  const hours = visibleHours(orders);
  const load = hourlyLoad(orders);
  const groups = groupByHour(orders);
  const scrolledFor = useRef<string | null>(null);
  const firstHour = hours[0];
  const lastHour = hours[hours.length - 1];
  const nowHour = nowMinutes === null ? null : Math.floor(nowMinutes / 60);

  // Auto-scroll to the current hour once per visit to today.
  useEffect(() => {
    if (nowMinutes === null) {
      scrolledFor.current = null;
      return;
    }
    if (scrolledFor.current === date) return;
    scrolledFor.current = date;
    const hour = Math.min(Math.max(Math.floor(nowMinutes / 60), firstHour), lastHour);
    document.getElementById(`hour-${hour}`)?.scrollIntoView({ block: "start" });
  }, [date, nowMinutes, firstHour, lastHour]);

  return (
    <div className="@container px-4 pt-4 pb-32 @2xl:px-6 @2xl:pt-6">
      {orders.length === 0 && <EmptyDay />}

      <ol aria-label="Распоред по часови" className="flex flex-col">
        {hours.map((hour) => {
          const slots = groups.get(hour);
          const past = nowMinutes !== null && (hour + 1) * 60 <= nowMinutes;
          const now = hour === nowHour ? nowMinutes : null;
          return slots ? (
            <BusyHour
              key={hour}
              hour={hour}
              pieces={load[hour] ?? 0}
              slots={slots}
              past={past}
              nowMinutes={now}
              onOpenOrder={onOpenOrder}
              onAddAt={onAddAt}
            />
          ) : (
            <FreeHour key={hour} hour={hour} nowMinutes={now} addTime={quickAddSlot(hour, nowMinutes)} onAddAt={onAddAt} />
          );
        })}
      </ol>
    </div>
  );
}

function EmptyDay() {
  return (
    <div className="flex flex-col items-center gap-2 px-6 pt-6 pb-8 text-center">
      <span className="mb-1 flex size-14 items-center justify-center rounded-full bg-card text-primary shadow-card">
        <CalendarPlusIcon className="size-7" aria-hidden />
      </span>
      <p className="type-headline">Нема нарачки за овој ден</p>
      <p className="max-w-xs type-subhead text-muted-foreground">
        Допрете „+“ покрај некој час или „Нова нарачка“ за да додадете прва нарачка.
      </p>
    </div>
  );
}

const GUTTER = "grid grid-cols-[52px_minmax(0,1fr)]";
const HOUR_LABEL = "type-footnote text-muted-foreground tabular-nums";

function FreeHour({
  hour,
  nowMinutes,
  addTime,
  onAddAt,
}: {
  hour: number;
  nowMinutes: number | null;
  addTime: string;
  onAddAt: (time: string) => void;
}) {
  return (
    <li id={`hour-${hour}`} aria-label={hourWindowLabel(hour)} className={cn(GUTTER, "relative scroll-mt-52")}>
      <span className={cn(HOUR_LABEL, "pt-4")}>{formatHM(hour, 0)}</span>
      <div className="flex min-h-13 items-center justify-between gap-3 border-t border-border pl-1">
        <span className="type-subhead text-muted-foreground">Слободно</span>
        <button
          type="button"
          onClick={() => onAddAt(addTime)}
          aria-label={`Додај нарачка во ${addTime}`}
          className="-mr-2 flex size-11 items-center justify-center rounded-full text-primary transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 active:bg-muted"
        >
          <PlusIcon className="size-5" aria-hidden />
        </button>
      </div>
      {nowMinutes !== null && (
        <NowMarker
          minutes={nowMinutes}
          className="absolute inset-x-0 -translate-y-1/2"
          style={{ top: `${((nowMinutes % 60) / 60) * 100}%` }}
          withGutter
        />
      )}
    </li>
  );
}

type BusyHourProps = {
  hour: number;
  pieces: number;
  slots: SlotGroup[];
  past: boolean;
  nowMinutes: number | null;
  onOpenOrder: (order: Order) => void;
  onAddAt: (time: string) => void;
};

function BusyHour({ hour, pieces, slots, past, nowMinutes, onOpenOrder, onAddAt }: BusyHourProps) {
  const freeSlots = SLOT_MINUTES.filter((m) => !slots.some((s) => s.minutes === hour * 60 + m));
  // Index of the first slot group after "now"; the marker goes before it.
  const nowIndex = nowMinutes === null ? -1 : slots.findIndex((s) => s.minutes > nowMinutes);
  const nowAt = nowMinutes === null ? null : nowIndex === -1 ? slots.length : nowIndex;
  const headingId = `hour-${hour}-title`;

  return (
    <li id={`hour-${hour}`} aria-labelledby={headingId} className={cn(GUTTER, "scroll-mt-52 py-1.5")}>
      <span className={cn(HOUR_LABEL, "pt-[18px] @2xl:pt-[22px]")}>{formatHM(hour, 0)}</span>

      <section
        className={cn(
          "flex min-w-0 flex-col gap-4 rounded-2xl p-4 shadow-card @2xl:p-5",
          past ? "bg-card/80" : "bg-card",
        )}
      >
        <header className="flex flex-col gap-2.5">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
            <h2 id={headingId} className="type-headline tabular-nums">
              {hourWindowLabel(hour)}
            </h2>
            <CapacityPill pieces={pieces} />
          </div>
          <CapacityBar pieces={pieces} />
        </header>

        <div className="flex flex-col gap-4">
          {slots.map((slot, i) => (
            <Fragment key={slot.time}>
              {nowAt === i && nowMinutes !== null && <NowMarker minutes={nowMinutes} />}
              <SlotGroupView slot={slot} onOpenOrder={onOpenOrder} />
            </Fragment>
          ))}
          {nowAt === slots.length && nowMinutes !== null && <NowMarker minutes={nowMinutes} />}
        </div>

        {freeSlots.length > 0 && (
          <div
            role="group"
            aria-label="Слободни термини"
            className="-mb-1.5 flex flex-wrap items-center gap-x-2 border-t border-border pt-1.5"
          >
            {freeSlots.map((m) => {
              const time = formatHM(hour, m);
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => onAddAt(time)}
                  aria-label={`Додај нарачка во ${time}`}
                  className="group flex h-11 items-center outline-none"
                >
                  <span className="inline-flex h-8 items-center gap-1 rounded-full bg-background px-3 type-footnote font-semibold text-muted-foreground tabular-nums transition-colors group-hover:text-foreground group-focus-visible:ring-3 group-focus-visible:ring-ring/50 group-active:bg-muted">
                    <PlusIcon className="size-3.5 text-primary" aria-hidden />
                    {time}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>
    </li>
  );
}

function SlotGroupView({ slot, onOpenOrder }: { slot: SlotGroup; onOpenOrder: (order: Order) => void }) {
  return (
    <div className="flex flex-col gap-2 @2xl:flex-row @2xl:gap-4">
      <h3 className="type-subhead font-semibold tabular-nums @2xl:w-12 @2xl:shrink-0 @2xl:pt-3">{slot.time}</h3>
      <ul className="grid min-w-0 flex-1 grid-cols-1 gap-2 @2xl:grid-cols-2 @5xl:grid-cols-3">
        {slot.orders.map((order) => (
          <li key={order.id} className="flex">
            <OrderCard order={order} onOpen={onOpenOrder} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Red "now" line with a dot and the current time. */
function NowMarker({
  minutes,
  withGutter = false,
  className,
  style,
}: {
  minutes: number;
  withGutter?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const label = formatHM(Math.floor(minutes / 60), minutes % 60);

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none z-10 flex items-center", withGutter && GUTTER, className)}
      style={style}
    >
      <span
        className={cn(
          "type-caption font-semibold text-destructive tabular-nums",
          withGutter ? "justify-self-start bg-background pr-1" : "mr-1.5",
        )}
      >
        {label}
      </span>
      <span className="flex flex-1 items-center">
        <span className="size-2 shrink-0 -translate-x-1 rounded-full bg-destructive" />
        <span className="h-px flex-1 -translate-x-1 bg-destructive" />
      </span>
    </div>
  );
}
