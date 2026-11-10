"use client";

import { CalendarDaysIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SHOP_NAME } from "@/lib/config";
import { formatLongDate } from "@/lib/dates";
import { DaySummary, type DayTotals } from "./day-summary";
import { WeekStrip } from "./week-strip";

type Props = {
  date: string;
  today: string;
  weekCounts: Record<string, number>;
  totals: DayTotals;
  onSelectDate: (date: string) => void;
  onOpenCalendar: () => void;
};

export function DayHeader({ date, today, weekCounts, totals, onSelectDate, onOpenCalendar }: Props) {
  const longDate = formatLongDate(date);

  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 pt-safe backdrop-blur supports-backdrop-filter:bg-background/85">
      <div className="flex items-center gap-2 px-4 pt-3">
        <div className="min-w-0 flex-1">
          <p className="truncate font-heading text-sm font-semibold text-primary">{SHOP_NAME}</p>
          <h1 className="truncate text-xl leading-tight font-bold first-letter:uppercase">
            {longDate}
          </h1>
        </div>
        <Button
          variant={date === today ? "secondary" : "outline"}
          onClick={() => onSelectDate(today)}
          disabled={date === today}
          className="disabled:opacity-60"
        >
          Денес
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onOpenCalendar}
          aria-label="Отвори календар"
        >
          <CalendarDaysIcon />
        </Button>
      </div>
      <WeekStrip date={date} today={today} counts={weekCounts} onSelect={onSelectDate} />
      <DaySummary totals={totals} />
    </header>
  );
}
