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
import { DayHeader } from "./day-header";

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
    <div className="mx-auto min-h-dvh w-full max-w-md bg-background shadow-[0_0_0_1px_var(--border)]">
      <DayHeader
        date={date}
        today={today}
        weekCounts={weekCounts}
        totals={totals}
        onSelectDate={goTo}
        onOpenCalendar={() => setCalendarOpen(true)}
      />

      <main className={cn("transition-opacity", navigating && "opacity-50")} aria-busy={navigating}>
        <Timeline
          date={date}
          orders={orders}
          nowMinutes={nowMinutes}
          onOpenOrder={(order) => setDetailsId(order.id)}
          onAddAt={(time) => openForm(undefined, time)}
        />
      </main>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 mx-auto flex max-w-md justify-end px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
        <Button
          size="lg"
          onClick={() => openForm()}
          className="pointer-events-auto h-14 rounded-full px-6 text-lg shadow-lg shadow-primary/30"
        >
          <PlusIcon className="size-6" />
          Нова нарачка
        </Button>
      </div>

      <CalendarDrawer
        open={calendarOpen}
        onOpenChange={setCalendarOpen}
        date={date}
        today={today}
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
