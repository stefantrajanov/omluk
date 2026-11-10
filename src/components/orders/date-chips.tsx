"use client";

import { useState } from "react";
import { CalendarDays, ChevronDown } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { addDaysISO, formatLongDate, parseISODate, toISODate, todayISO } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { ChoiceChip } from "./choice-chip";

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function DateChips({
  value,
  onChange,
  minDate,
}: {
  value: string;
  onChange: (date: string) => void;
  /** Earliest pickable date; earlier days are disabled. */
  minDate?: string;
}) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const today = todayISO();
  const tomorrow = addDaysISO(today, 1);
  const isOther = value !== today && value !== tomorrow;

  function pick(date: string) {
    onChange(date);
    setCalendarOpen(false);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <span className="type-subhead font-semibold text-foreground">Датум</span>
        <span className="truncate type-subhead text-muted-foreground">
          {capitalize(formatLongDate(value))}
        </span>
      </div>
      <div role="group" aria-label="Датум" className="grid grid-cols-3 gap-2">
        <ChoiceChip
          selected={value === today}
          disabled={minDate !== undefined && today < minDate}
          onClick={() => pick(today)}
          className="px-2"
        >
          Денес
        </ChoiceChip>
        <ChoiceChip selected={value === tomorrow} onClick={() => pick(tomorrow)} className="px-2">
          Утре
        </ChoiceChip>
        {/* Short label keeps all three on one row; the full date is shown above. */}
        <ChoiceChip
          selected={isOther}
          aria-expanded={calendarOpen}
          aria-label="Друг датум"
          onClick={() => setCalendarOpen((o) => !o)}
          className="gap-1 px-2"
        >
          <CalendarDays className="size-[18px] shrink-0" aria-hidden />
          Друг
          <ChevronDown
            className={cn("size-4 shrink-0 transition-transform duration-200", calendarOpen && "rotate-180")}
            aria-hidden
          />
        </ChoiceChip>
      </div>
      {calendarOpen && (
        <div className="flex justify-center rounded-xl bg-background p-3">
          <Calendar
            mode="single"
            weekStartsOn={1}
            selected={parseISODate(value)}
            defaultMonth={parseISODate(value)}
            disabled={minDate ? { before: parseISODate(minDate) } : undefined}
            onSelect={(d) => d && pick(toISODate(d))}
          />
        </div>
      )}
    </div>
  );
}
