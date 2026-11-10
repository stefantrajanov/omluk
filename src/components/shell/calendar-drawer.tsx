"use client";

import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { MonthCalendar } from "./month-calendar";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string;
  today: string;
  weekCounts: Record<string, number>;
  onSelect: (date: string) => void;
};

/** Month picker sheet for phones and tablets. */
export function CalendarDrawer({ open, onOpenChange, date, today, weekCounts, onSelect }: Props) {
  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Избери ден"
      description="Бројот под датумот е број на нарачки."
    >
      <div className="rounded-2xl bg-card p-2 shadow-card md:p-3">
        <MonthCalendar date={date} today={today} weekCounts={weekCounts} onSelect={onSelect} />
      </div>
    </ResponsiveSheet>
  );
}
