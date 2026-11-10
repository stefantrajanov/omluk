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
}: {
  value: string;
  onChange: (date: string) => void;
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
      <div role="group" aria-label="Датум" className="flex flex-wrap gap-2">
        <ChoiceChip selected={value === today} onClick={() => pick(today)}>
          Денес
        </ChoiceChip>
        <ChoiceChip selected={value === tomorrow} onClick={() => pick(tomorrow)}>
          Утре
        </ChoiceChip>
        <ChoiceChip
          selected={isOther}
          aria-expanded={calendarOpen}
          onClick={() => setCalendarOpen((o) => !o)}
        >
          <CalendarDays className="size-[18px]" aria-hidden />
          {isOther ? capitalize(formatLongDate(value)) : "Друг датум"}
          <ChevronDown
            className={cn("size-4 transition-transform duration-200", calendarOpen && "rotate-180")}
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
            onSelect={(d) => d && pick(toISODate(d))}
          />
        </div>
      )}
    </div>
  );
}
