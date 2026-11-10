"use client";

import { endOfMonth, endOfWeek, startOfMonth, startOfWeek } from "date-fns";
import { useEffect, useRef, useState, type ComponentProps } from "react";
import type { DayButton } from "react-day-picker";
import { getCalendarCountsAction } from "@/app/actions";
import { Calendar } from "@/components/ui/calendar";
import { parseISODate as toDate, toISODate as toIso } from "@/lib/dates";
import { cn } from "@/lib/utils";

type DayCounts = Record<string, number>;

/** Full visible grid of a month (Monday-first weeks, incl. outside days). */
function monthGridRange(month: Date): { from: string; to: string } {
  return {
    from: toIso(startOfWeek(startOfMonth(month), { weekStartsOn: 1 })),
    to: toIso(endOfWeek(endOfMonth(month), { weekStartsOn: 1 })),
  };
}

type Props = {
  date: string;
  today: string;
  onSelect: (date: string) => void;
  /** Fresh counts for the selected week; overlay the fetched month. */
  weekCounts: DayCounts;
  /** Changes whenever server data refreshes, to refetch month counts. */
  revision?: unknown;
  className?: string;
};

/** Month grid with per-day order counts; follows the selected date's month. */
export function MonthCalendar({ date, today, onSelect, weekCounts, revision, className }: Props) {
  const [month, setMonth] = useState(() => toDate(date));
  const [syncedDate, setSyncedDate] = useState(date);
  if (syncedDate !== date) {
    setSyncedDate(date);
    setMonth(toDate(date));
  }

  const [counts, setCounts] = useState<{ key: string; data: DayCounts } | null>(null);
  const range = monthGridRange(month);
  const rangeKey = `${range.from}|${range.to}`;

  useEffect(() => {
    let cancelled = false;
    const [from, to] = rangeKey.split("|");
    getCalendarCountsAction(from, to).then((data) => {
      if (!cancelled) setCounts({ key: rangeKey, data: data ?? {} });
    });
    return () => {
      cancelled = true;
    };
  }, [rangeKey, revision]);

  const visibleCounts = counts?.key === rangeKey ? { ...counts.data, ...weekCounts } : null;

  return (
    <div className={className}>
      <Calendar
        mode="single"
        required
        selected={toDate(date)}
        month={month}
        onMonthChange={setMonth}
        today={toDate(today)}
        weekStartsOn={1}
        onSelect={(d) => onSelect(toIso(d))}
        className="w-full"
        classNames={{
          root: "w-full",
          month_caption: "flex h-11 w-full items-center pl-2",
          nav: "absolute top-0 right-0 z-10 flex items-center gap-1",
          day: "relative w-full p-0 text-center select-none",
        }}
        components={{
          DayButton: (props) => <CountDayButton {...props} counts={visibleCounts} />,
        }}
      />
      {visibleCounts === null && (
        <p className="mt-1 text-center type-footnote text-muted-foreground">Се вчитуваат нарачките…</p>
      )}
    </div>
  );
}

function CountDayButton({
  counts,
  day,
  modifiers,
  className,
  children,
  ...props
}: ComponentProps<typeof DayButton> & { counts: DayCounts | null }) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  const count = counts?.[toIso(day.date)] ?? 0;
  const selected = modifiers.selected;
  const label = props["aria-label"];

  return (
    <button
      ref={ref}
      type="button"
      {...props}
      aria-label={count > 0 && label ? `${label}, нарачки: ${count}` : label}
      className={cn(
        "group/count flex h-14 w-full flex-col items-center justify-start gap-0.5 rounded-xl pt-1 outline-none focus-visible:ring-3 focus-visible:ring-ring/40 disabled:opacity-40",
        className,
      )}
    >
      <span
        className={cn(
          "flex size-9 items-center justify-center rounded-full text-[17px] tabular-nums transition-colors",
          selected
            ? "bg-primary font-semibold text-primary-foreground"
            : modifiers.today
              ? "font-semibold text-primary group-hover/count:bg-accent"
              : modifiers.outside
                ? "text-muted-foreground group-hover/count:bg-muted"
                : "text-foreground group-hover/count:bg-muted",
        )}
      >
        {children}
      </span>
      <span
        aria-hidden
        className={cn(
          "h-4 min-w-4 rounded-full px-1 text-[11px] leading-4 font-semibold tabular-nums",
          count === 0 && "invisible",
          selected ? "bg-accent text-accent-foreground" : "bg-secondary text-foreground",
        )}
      >
        {count}
      </span>
    </button>
  );
}
