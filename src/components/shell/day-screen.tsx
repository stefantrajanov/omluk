"use client";

import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { OrderDetailsDrawer } from "@/components/orders/order-details-drawer";
import { OrderFormDrawer } from "@/components/orders/order-form-drawer";
import { Timeline } from "@/components/timeline/timeline";
import { Button } from "@/components/ui/button";
import { useAutoRefresh } from "@/hooks/use-auto-refresh";
import { useShopNow } from "@/hooks/use-shop-now";
import { orderPieces } from "@/lib/capacity";
import type { Order } from "@/lib/orders/types";
import { cn } from "@/lib/utils";
import { CalendarDrawer } from "./calendar-drawer";
import { DayHeader, DayTitle } from "./day-header";
import { DaySummary } from "./day-summary";
import { Sidebar } from "./sidebar";
import { WeekStrip } from "./week-strip";

type Props = {
  date: string;
  today: string;
  orders: Order[];
  weekCounts: Record<string, number>;
};

type FormState = { open: boolean; key: number; order?: Order; defaultTime?: string };

export function DayScreen({ date, today, orders, weekCounts }: Props) {
  const router = useRouter();
  const [navigating, startNavigation] = useTransition();
  const now = useShopNow();
  useAutoRefresh();

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [form, setForm] = useState<FormState>({ open: false, key: 0 });
  const [detailsId, setDetailsId] = useState<string | null>(null);

  // Look up by id so the details drawer reflects refreshed server data.
  const detailsOrder = orders.find((o) => o.id === detailsId) ?? null;
  const nowMinutes = now && now.date === date ? now.minutes : null;

  const totals = {
    orders: orders.length,
    pieces: orders.reduce((sum, o) => sum + orderPieces(o), 0),
    done: orders.filter((o) => o.status === "done").length,
    total: orders.reduce((sum, o) => sum + o.total, 0),
  };

  function goTo(next: string) {
    if (next === date) return;
    startNavigation(() => {
      router.push(`/?d=${next}`, { scroll: false });
    });
    window.scrollTo({ top: 0 });
  }

  // New key per open so the form remounts with fresh defaults.
  function openForm(order?: Order, defaultTime?: string) {
    setForm((f) => ({ open: true, key: f.key + 1, order, defaultTime }));
  }

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[320px_minmax(0,1fr)]">
      <Sidebar
        date={date}
        today={today}
        weekCounts={weekCounts}
        totals={totals}
        revision={orders}
        onSelectDate={goTo}
        onNewOrder={() => openForm()}
      />

      <div className="min-w-0">
        <DayHeader
          date={date}
          today={today}
          onSelectDate={goTo}
          onOpenCalendar={() => setCalendarOpen(true)}
        />

        <div className="mx-auto w-full max-w-3xl pb-safe lg:max-w-5xl">
          <div className="flex flex-col gap-4 px-4 pt-4 md:px-6 md:pt-6 lg:px-8">
            <DayTitle date={date} today={today} />
            <WeekStrip date={date} today={today} counts={weekCounts} onSelect={goTo} />
            <DaySummary totals={totals} className="lg:hidden" />
          </div>

          <main
            className={cn("mt-2 transition-opacity md:mt-4 lg:px-2", navigating && "opacity-50")}
            aria-busy={navigating}
          >
            <Timeline
              date={date}
              orders={orders}
              nowMinutes={nowMinutes}
              today={now?.date ?? today}
              onOpenOrder={(order) => setDetailsId(order.id)}
              onAddAt={(time) => openForm(undefined, time)}
            />
          </main>
        </div>
      </div>

      <Button
        size="icon"
        onClick={() => openForm()}
        aria-label="Нова нарачка"
        className="fixed right-4 bottom-[calc(env(safe-area-inset-bottom)+1rem)] z-20 size-14 rounded-full shadow-float lg:hidden"
      >
        <PlusIcon className="size-7" strokeWidth={2.5} />
      </Button>

      <CalendarDrawer
        open={calendarOpen}
        onOpenChange={setCalendarOpen}
        date={date}
        today={today}
        weekCounts={weekCounts}
        onSelect={(d) => {
          setCalendarOpen(false);
          goTo(d);
        }}
      />

      <OrderFormDrawer
        key={form.key}
        open={form.open}
        onOpenChange={(open) => setForm((f) => ({ ...f, open }))}
        order={form.order}
        defaultDate={date}
        defaultTime={form.defaultTime}
      />

      <OrderDetailsDrawer
        order={detailsOrder}
        onOpenChange={(open) => {
          if (!open) setDetailsId(null);
        }}
        onEdit={(order) => {
          setDetailsId(null);
          openForm(order);
        }}
      />
    </div>
  );
}
