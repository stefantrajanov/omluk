"use client";

import { useId, useRef, useState, useTransition, type FormEvent, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { formatPrice } from "@/lib/capacity";
import { CLOSE_HOUR, OPEN_HOUR, formatHM, nextSlot, todayISO } from "@/lib/dates";
import { createOrder, updateOrder } from "@/lib/orders/actions";
import type { Order, OrderInput } from "@/lib/orders/types";
import { cn } from "@/lib/utils";
import { CapacityLine } from "./capacity-line";
import { DateChips } from "./date-chips";
import { FieldMessage, GroupedCard, GroupedSection } from "./grouped-section";
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
  const { open } = props;
  // Fresh form state on every open; the same instance animates closed.
  const [session, setSession] = useState({ open, key: 0 });
  if (open !== session.open) setSession({ open, key: open ? session.key + 1 : session.key });

  return <OrderFormSheet key={session.key} {...props} />;
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

function OrderFormSheet({ open, order, defaultDate, defaultTime, onOpenChange, onSaved }: Props) {
  // Snapshot so content stays stable while the sheet animates closed.
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
  const formId = useId();

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

  const footer = (
    <div className="flex items-center gap-4">
      <div className="shrink-0">
        <p className="type-footnote text-muted-foreground tabular-nums">{pieces} парч.</p>
        <p className="type-title3 tabular-nums">{formatPrice(total)}</p>
      </div>
      <Button
        type="submit"
        form={formId}
        size="lg"
        className="min-w-0 flex-1 md:ml-auto md:max-w-64"
        disabled={pending}
      >
        {pending && <Loader2 className="animate-spin" aria-hidden />}
        {editing ? "Зачувај измени" : "Зачувај нарачка"}
      </Button>
    </div>
  );

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={onOpenChange}
      title={editing ? "Измени нарачка" : "Нова нарачка"}
      description={<span className="sr-only">Внесете купувач, термин и производи.</span>}
      footer={footer}
      size="lg"
    >
      <form id={formId} onSubmit={handleSubmit} noValidate className="flex flex-col gap-6 pb-2">
        <GroupedSection title="Клиент">
          <GroupedCard className="divide-y divide-border">
            <FieldRow label="Име" htmlFor="order-name" invalid={nameError}>
              <input
                id="order-name"
                ref={nameRef}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Име на купувач"
                autoFocus={!editing}
                autoComplete="off"
                enterKeyHint="next"
                aria-invalid={nameError || undefined}
                aria-describedby={nameError ? "order-name-error" : undefined}
                className={rowInput}
              />
            </FieldRow>
            <FieldRow label="Телефон" htmlFor="order-phone">
              <input
                id="order-phone"
                type="tel"
                inputMode="tel"
                autoComplete="off"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Незадолжително"
                className={cn(rowInput, "tabular-nums")}
              />
            </FieldRow>
          </GroupedCard>
          {nameError && <FieldMessage id="order-name-error">Внесете име на купувачот.</FieldMessage>}
        </GroupedSection>

        <GroupedSection title="Термин">
          <GroupedCard className="flex flex-col gap-5 p-4">
            <DateChips value={date} onChange={setDate} />
            <div className="h-px bg-border" aria-hidden />
            <TimePicker
              hour={hour}
              minute={minute}
              extraHour={outsideHours ? initial.hour : undefined}
              onChange={(h, m) => {
                setHour(h);
                setMinute(m);
              }}
            />
          </GroupedCard>
          <CapacityLine date={date} hour={hour} pieces={pieces} excludeOrderId={editing?.id} />
        </GroupedSection>

        <GroupedSection title="Производи">
          <ItemList items={items} onChange={setItems} />
          {itemsError && <FieldMessage>Додадете барем еден производ.</FieldMessage>}
        </GroupedSection>

        <GroupedSection title="Додај производ">
          <ItemPicker onAdd={(sel) => setItems((prev) => addDraftItem(prev, sel))} />
        </GroupedSection>

        <GroupedSection title="Забелешка" titleId="order-notes-label">
          <GroupedCard>
            <textarea
              id="order-notes"
              aria-labelledby="order-notes-label"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Дополнителни барања"
              rows={3}
              className="field-sizing-content block min-h-24 w-full resize-none rounded-2xl bg-transparent px-4 py-3 type-body text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </GroupedCard>
        </GroupedSection>
      </form>
    </ResponsiveSheet>
  );
}

const rowInput =
  "h-[52px] min-w-0 flex-1 bg-transparent type-body text-foreground outline-none placeholder:text-muted-foreground";

function FieldRow({
  label,
  htmlFor,
  invalid,
  children,
}: {
  label: string;
  htmlFor: string;
  invalid?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-[52px] items-center gap-3 px-4">
      <label
        htmlFor={htmlFor}
        className={cn("w-20 shrink-0 type-body transition-colors", invalid ? "text-destructive" : "text-foreground")}
      >
        {label}
      </label>
      {children}
    </div>
  );
}
