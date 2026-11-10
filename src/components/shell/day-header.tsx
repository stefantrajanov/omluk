"use client";

import { CalendarDaysIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { addDaysISO, formatLongDate } from "@/lib/dates";

type Props = {
  date: string;
  today: string;
  onSelectDate: (date: string) => void;
  onOpenCalendar: () => void;
};

/** Phone/tablet: translucent top bar. Desktop: sticky large-title bar with day navigation. */
export function DayHeader({ date, today, onSelectDate, onOpenCalendar }: Props) {
  const isToday = date === today;

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 pt-safe backdrop-blur-xl backdrop-saturate-150 lg:hidden">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-2 px-4 md:px-6">
          <Logo variant="horizontal" className="h-8 w-auto shrink-0 text-foreground" />
          <div className="flex-1" />
          <Button variant="ghost" onClick={() => onSelectDate(today)} disabled={isToday} className="px-3">
            Денес
          </Button>
          <Button variant="ghost" size="icon" onClick={onOpenCalendar} aria-label="Отвори календар">
            <CalendarDaysIcon className="size-[22px]" />
          </Button>
        </div>
      </header>

      <header className="sticky top-0 z-30 hidden border-b border-border bg-background/80 backdrop-blur-xl backdrop-saturate-150 lg:block">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-8 py-4">
          <h1 className="min-w-0 flex-1 truncate type-large-title first-letter:uppercase">{formatLongDate(date)}</h1>
          <Button
            variant="secondary"
            size="icon"
            onClick={() => onSelectDate(addDaysISO(date, -1))}
            aria-label="Претходен ден"
          >
            <ChevronLeftIcon strokeWidth={2.5} />
          </Button>
          <Button variant="secondary" onClick={() => onSelectDate(today)} disabled={isToday}>
            Денес
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={() => onSelectDate(addDaysISO(date, 1))}
            aria-label="Следен ден"
          >
            <ChevronRightIcon strokeWidth={2.5} />
          </Button>
        </div>
      </header>
    </>
  );
}

/** Large-title date for phone/tablet; desktop shows it in the sticky header. */
export function DayTitle({ date, today }: { date: string; today: string }) {
  return (
    <div className="lg:hidden">
      {date === today && <p className="type-subhead font-semibold text-primary">Денес</p>}
      <h1 className="type-title1 text-balance first-letter:uppercase md:type-large-title">{formatLongDate(date)}</h1>
    </div>
  );
}
