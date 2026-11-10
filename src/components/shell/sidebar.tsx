"use client";

import { PlusIcon } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { LG_QUERY, useMediaQuery } from "@/hooks/use-media-query";
import { DaySummary, type DayTotals } from "./day-summary";
import { MonthCalendar } from "./month-calendar";

type Props = {
  date: string;
  today: string;
  weekCounts: Record<string, number>;
  totals: DayTotals;
  revision: unknown;
  onSelectDate: (date: string) => void;
  onNewOrder: () => void;
};

/** Desktop-only left pane: brand, primary action, month and day overview. */
export function Sidebar({ date, today, weekCounts, totals, revision, onSelectDate, onNewOrder }: Props) {
  // Mount the calendar only where visible, so phones skip its count fetches.
  const isDesktop = useMediaQuery(LG_QUERY);

  return (
    <aside className="sticky top-0 hidden h-dvh flex-col overflow-y-auto overscroll-contain border-r border-border bg-card pt-safe lg:flex">
      <div className="flex flex-col gap-6 px-6 pt-6 pb-8">
        <Logo variant="horizontal" className="h-10 w-auto self-start text-foreground" />

        <Button size="lg" onClick={onNewOrder} className="w-full">
          <PlusIcon className="size-[22px]" strokeWidth={2.5} />
          Нова нарачка
        </Button>

        <section aria-label="Календар" className="-mx-2 min-h-[372px]">
          {isDesktop && (
            <MonthCalendar
              date={date}
              today={today}
              weekCounts={weekCounts}
              revision={revision}
              onSelect={onSelectDate}
            />
          )}
        </section>

        <section aria-labelledby="day-overview">
          <h2 id="day-overview" className="mb-2 px-4 type-footnote text-muted-foreground uppercase">
            Преглед на денот
          </h2>
          <DaySummary totals={totals} layout="list" />
        </section>
      </div>
    </aside>
  );
}
