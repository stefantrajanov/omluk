"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatPrice } from "@/lib/capacity";
import { CLOSE_HOUR, OPEN_HOUR, formatHM, nextSlot, todayISO } from "@/lib/dates";
import { createOrder, updateOrder } from "@/lib/orders/actions";
import type { Order, OrderInput } from "@/lib/orders/types";
import { CapacityLine } from "./capacity-line";
import { DateChips } from "./date-chips";
import { ItemList, ItemPicker, addDraftItem, newDraftKey, type DraftItem } from "./item-builder";
import { TimePicker } from "./time-picker";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order?: Order;
  defaultDate: string;
  defaultTime?: string;
  onSaved?: () => void;
};

export function OrderFormDrawer(props: Props) {
  const { open, onOpenChange } = props;
  // New body (fresh state) on every open.
  const [session, setSession] = useState({ open, key: 0 });
  if (open !== session.open) setSession({ open, key: open ? session.key + 1 : session.key });

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="data-[vaul-drawer-direction=bottom]:max-h-[94dvh]">
        <OrderFormBody key={session.key} {...props} />
      </DrawerContent>
    </Drawer>
  );
}

const parseHM = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return { hour: h || 0, minute: m || 0 };
};

function initialTime(date: string, defaultTime?: string, order?: Order) {
  if (order) return parseHM(order.time);
  if (defaultTime) return parseHM(defaultTime);
  if (date !== todayISO()) return { hour: 12, minute: 0 };
  const slot = nextSlot();
  if (slot.date !== date) return { hour: CLOSE_HOUR - 1, minute: 45 };
  const { hour, minute } = parseHM(slot.time);
  if (hour < OPEN_HOUR) return { hour: OPEN_HOUR, minute: 0 };
  if (hour >= CLOSE_HOUR) return { hour: CLOSE_HOUR - 1, minute: 45 };
  return { hour, minute };
}

function OrderFormBody({ order, defaultDate, defaultTime, onOpenChange, onSaved }: Props) {
  // Snapshot so content stays stable while the drawer animates closed.
  const [initial] = useState(() => {
    const date = order?.date ?? defaultDate;
    return { order, date, ...initialTime(date, defaultTime, order) };
  });
  const editing = initial.order;

  const [name, setName] = useState(editing?.customerName ?? "");
  const [phone, setPhone] = useState(editing?.phone ?? "");
  const [date, setDate] = useState(initial.date);
  const [hour, setHour] = useState(initial.hour);
  const [minute, setMinute] = useState(initial.minute);
  const [notes, setNotes] = useState(editing?.notes ?? "");
  const [items, setItems] = useState<DraftItem[]>(
    () =>
      editing?.items.map((i) => ({
        key: newDraftKey(),
        productKey: i.productKey,
        label: i.label,
        unitPrice: i.unitPrice,
        quantity: i.quantity,
        note: i.note ?? "",
      })) ?? [],
  );
  const [showErrors, setShowErrors] = useState(false);
  const [pending, startTransition] = useTransition();
  const nameRef = useRef<HTMLInputElement>(null);

  const pieces = items.reduce((s, i) => s + i.quantity, 0);
  const total = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const nameError = showErrors && !name.trim();
  const itemsError = showErrors && items.length === 0;
  const outsideHours = initial.hour < OPEN_HOUR || initial.hour >= CLOSE_HOUR;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || items.length === 0) {
      setShowErrors(true);
      if (!name.trim()) nameRef.current?.focus();
      return;
    }
    const input: OrderInput = {
      customerName: name.trim(),
      phone: phone.trim() || null,
      date,
      time: formatHM(hour, minute),
      notes: notes.trim() || null,
      items: items.map((i) => ({
        productKey: i.productKey,
        quantity: i.quantity,
        note: i.note.trim() || null,
      })),
    };
    startTransition(async () => {
      try {
        const res = editing ? await updateOrder(editing.id, input) : await createOrder(input);
        if (!res.ok) {
          toast.error(res.error);
          return;
        }
        toast.success(editing ? "Измените се зачувани" : "Нарачката е зачувана");
        onSaved?.();
        onOpenChange(false);
      } catch {
        toast.error("Нешто тргна наопаку. Обидете се повторно.");
      }
    });
  }

  return (
    <>
      <DrawerHeader className="border-b pt-2 pb-3 text-left md:text-left">
        <DrawerTitle className="text-xl font-semibold">
          {editing ? "Измени нарачка" : "Нова нарачка"}
        </DrawerTitle>
        <DrawerDescription className="sr-only">
          Внесете купувач, термин и производи.
        </DrawerDescription>
      </DrawerHeader>

      <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
        <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain px-4 py-4">
          <section className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="order-name">Име на купувач</Label>
              <Input
                id="order-name"
                ref={nameRef}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus={!editing}
                autoComplete="off"
                enterKeyHint="next"
                aria-invalid={nameError || undefined}
                aria-describedby={nameError ? "order-name-error" : undefined}
              />
              {nameError && (
                <p id="order-name-error" className="text-sm text-destructive">
                  Внесете име на купувачот.
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="order-phone">
                Телефон <span className="font-normal text-muted-foreground">(незадолжително)</span>
              </Label>
              <Input
                id="order-phone"
                type="tel"
                inputMode="tel"
                autoComplete="off"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="text-sm font-medium">Датум</h3>
            <DateChips value={date} onChange={setDate} />
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="text-sm font-medium">
              Време <span className="font-semibold tabular-nums text-primary">{formatHM(hour, minute)}</span>
            </h3>
            <TimePicker
              hour={hour}
              minute={minute}
              extraHour={outsideHours ? initial.hour : undefined}
              onChange={(h, m) => {
                setHour(h);
                setMinute(m);
              }}
            />
            <CapacityLine date={date} hour={hour} pieces={pieces} excludeOrderId={editing?.id} />
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="text-sm font-medium">Производи</h3>
            <ItemList items={items} onChange={setItems} />
            {itemsError && (
              <p className="text-sm text-destructive">Додадете барем еден производ.</p>
            )}
            <ItemPicker onAdd={(sel) => setItems((prev) => addDraftItem(prev, sel))} />
          </section>

          <section className="flex flex-col gap-1.5">
            <Label htmlFor="order-notes">Забелешка</Label>
            <Textarea
              id="order-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </section>
        </div>

        <div className="flex items-center gap-3 border-t bg-popover px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <div className="shrink-0">
            <p className="text-lg leading-tight font-semibold tabular-nums">{formatPrice(total)}</p>
            <p className="text-sm text-muted-foreground tabular-nums">{pieces} парч.</p>
          </div>
          <Button type="submit" size="lg" className="flex-1" disabled={pending}>
            {pending && <Loader2 className="animate-spin" aria-hidden />}
            {editing ? "Зачувај измени" : "Зачувај нарачка"}
          </Button>
        </div>
      </form>
    </>
  );
}
