"use client";

import { format } from "date-fns";
import { mk } from "date-fns/locale/mk";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSwipe } from "@/hooks/use-swipe";
import { addDaysISO, formatLongDate, formatWeekdayShort, parseISODate, weekDates } from "@/lib/dates";
import { cn } from "@/lib/utils";

type Props = {
  date: string;
  today: string;
  counts: Record<string, number>;
  onSelect: (date: string) => void;
  className?: string;
};

export function WeekStrip({ date, today, counts, onSelect, className }: Props) {
  const days = weekDates(date);
  const prevWeek = () => onSelect(addDaysISO(date, -7));
  const nextWeek = () => onSelect(addDaysISO(date, 7));
  const swipe = useSwipe(nextWeek, prevWeek);

  return (
    <nav
      aria-label="Денови во неделата"
      className={cn("rounded-2xl bg-card px-2 pt-1 pb-3 shadow-card md:px-3", className)}
      {...swipe}
    >
      <div className="flex items-center gap-1 pl-2">
        <p className="flex-1 type-headline capitalize">{format(parseISODate(date), "LLLL yyyy", { locale: mk })}</p>
        <Button variant="ghost" size="icon" onClick={prevWeek} aria-label="Претходна недела">
          <ChevronLeftIcon strokeWidth={2.5} />
        </Button>
        <Button variant="ghost" size="icon" onClick={nextWeek} aria-label="Следна недела">
          <ChevronRightIcon strokeWidth={2.5} />
        </Button>
      </div>

      <ol className="grid grid-cols-7">
        {days.map((day) => {
          const selected = day === date;
          const isToday = day === today;
          const count = counts[day] ?? 0;
          return (
            <li key={day} className="flex justify-center">
              <button
                type="button"
                onClick={() => onSelect(day)}
                aria-current={selected ? "date" : undefined}
                aria-label={`${formatLongDate(day)}, нарачки: ${count}`}
                className="group flex w-full max-w-16 flex-col items-center gap-1 rounded-xl py-1 outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
              >
                <span className="type-caption text-muted-foreground capitalize">{formatWeekdayShort(day)}</span>
                <span
                  className={cn(
                    "flex size-10 items-center justify-center rounded-full text-[19px] tabular-nums transition-colors",
                    selected
                      ? "bg-primary font-semibold text-primary-foreground"
                      : isToday
                        ? "font-semibold text-primary group-hover:bg-accent"
                        : "font-normal text-foreground group-hover:bg-muted group-active:bg-muted",
                  )}
                >
                  {parseISODate(day).getDate()}
                </span>
                <span
                  aria-hidden
                  className={cn(
                    "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[12px] leading-none font-semibold tabular-nums",
                    count === 0 && "invisible",
                    selected ? "bg-accent text-accent-foreground" : "bg-secondary text-foreground",
                  )}
                >
                  {count}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
