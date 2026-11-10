"use client";

import { useEffect, useState, type ComponentProps } from "react";
import type { DayButton } from "react-day-picker";
import { endOfMonth, endOfWeek, startOfMonth, startOfWeek } from "date-fns";
import { getCalendarCountsAction } from "@/app/actions";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import { parseISODate as toDate, toISODate as toIso } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { AppDrawer } from "./app-drawer";

type DayCounts = Record<string, number>;

/** Full visible grid of a month (Monday-first weeks, incl. outside days). */
function monthGridRange(month: Date): { from: string; to: string } {
  return {
    from: toIso(startOfWeek(startOfMonth(month), { weekStartsOn: 1 })),
    to: toIso(endOfWeek(endOfMonth(month), { weekStartsOn: 1 })),
  };
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string;
  today: string;
  onSelect: (date: string) => void;
};

export function CalendarDrawer({ open, onOpenChange, date, today, onSelect }: Props) {
  const [month, setMonth] = useState(() => toDate(date));
  const [counts, setCounts] = useState<{ key: string; data: DayCounts } | null>(null);
  const range = monthGridRange(month);
  const rangeKey = `${range.from}|${range.to}`;

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const [from, to] = rangeKey.split("|");
    getCalendarCountsAction(from, to).then((data) => {
      if (!cancelled) setCounts({ key: rangeKey, data: data ?? {} });
    });
    return () => {
      cancelled = true;
    };
  }, [open, rangeKey]);

  const visibleCounts = counts?.key === rangeKey ? counts.data : null;

  function handleOpenChange(next: boolean) {
    if (next) setMonth(toDate(date));
    onOpenChange(next);
  }

  return (
    <AppDrawer open={open} onOpenChange={handleOpenChange} title="Избери ден" description="Бројот под датумот е број на нарачки.">
      <div className="px-3 pb-[calc(env(safe-area-inset-bottom)+1.25rem)]">
        <Calendar
          mode="single"
          required
          selected={toDate(date)}
          month={month}
          onMonthChange={setMonth}
          today={toDate(today)}
          weekStartsOn={1}
          onSelect={(d) => onSelect(toIso(d))}
          className="w-full bg-transparent p-0 [--cell-size:--spacing(12)]"
          classNames={{ root: "w-full", caption_label: "text-base font-bold first-letter:uppercase" }}
          components={{
            DayButton: (props) => <CountDayButton {...props} counts={visibleCounts} />,
          }}
        />
        {visibleCounts === null && (
          <p className="mt-2 text-center text-sm text-muted-foreground">Се вчитуваат нарачките…</p>
        )}
      </div>
    </AppDrawer>
  );
}

function CountDayButton({
  counts,
  children,
  className,
  ...props
}: ComponentProps<typeof DayButton> & { counts: DayCounts | null }) {
  const count = counts?.[toIso(props.day.date)] ?? 0;
  const selected = props.modifiers.selected;
  return (
    <CalendarDayButton
      {...props}
      className={cn("text-base font-semibold", props.modifiers.today && !selected && "text-primary", className)}
    >
      {children}
      <span
        aria-label={count > 0 ? `нарачки: ${count}` : undefined}
        className={cn(
          "min-h-4 min-w-4 rounded-full px-1 text-[0.65rem]! leading-4 font-bold opacity-100!",
          count === 0 && "invisible",
          selected ? "bg-card text-primary" : "bg-primary/15 text-primary",
        )}
      >
        {count}
      </span>
    </CalendarDayButton>
  );
}
