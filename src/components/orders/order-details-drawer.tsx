"use client";

import { useOptimistic, useState, useTransition } from "react";
import { Check, Loader2, Pencil, Phone, RotateCcw, StickyNote, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { formatPrice, orderPieces } from "@/lib/capacity";
import { formatLongDate } from "@/lib/dates";
import { deleteOrder, setOrderStatus } from "@/lib/orders/actions";
import type { Order, OrderStatus } from "@/lib/orders/types";
import { cn } from "@/lib/utils";
import { GroupedCard, GroupedSection } from "./grouped-section";

const FAILED = "Нешто тргна наопаку. Обидете се повторно.";

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function OrderDetailsDrawer({
  order,
  onOpenChange,
  onEdit,
}: {
  order: Order | null;
  onOpenChange: (open: boolean) => void;
  onEdit: (order: Order) => void;
}) {
  // Keep the last order visible during the close animation.
  const [shown, setShown] = useState(order);
  if (order && order !== shown) setShown(order);
  if (!shown) return null;

  return (
    <OrderDetailsSheet
      key={shown.id}
      open={order !== null}
      order={shown}
      onOpenChange={onOpenChange}
      onEdit={onEdit}
    />
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const done = status === "done";
  return (
    <Badge
      variant="secondary"
      className={cn(
        "h-6 gap-1 px-2.5 text-[13px] leading-[18px] font-semibold [&>svg]:size-3.5!",
        done && "bg-success-soft text-success-strong [&>svg]:text-success",
      )}
    >
      {done && <Check strokeWidth={3} aria-hidden />}
      {done ? "Готова" : "Нова"}
    </Badge>
  );
}

function OrderDetailsSheet({
  open,
  order,
  onOpenChange,
  onEdit,
}: {
  open: boolean;
  order: Order;
  onOpenChange: (open: boolean) => void;
  onEdit: (order: Order) => void;
}) {
  const [status, setOptimisticStatus] = useOptimistic(order.status);
  const [statusPending, startStatus] = useTransition();
  const [deletePending, startDelete] = useTransition();
  const busy = statusPending || deletePending;
  const done = status === "done";

  function toggleStatus() {
    const next: OrderStatus = done ? "pending" : "done";
    startStatus(async () => {
      setOptimisticStatus(next);
      try {
        const res = await setOrderStatus(order.id, next);
        if (!res.ok) toast.error(res.error);
        else toast.success(next === "done" ? "Означена како готова" : "Вратена како нова");
      } catch {
        toast.error(FAILED);
      }
    });
  }

  function handleDelete() {
    startDelete(async () => {
      try {
        const res = await deleteOrder(order.id);
        if (!res.ok) {
          toast.error(res.error);
          return;
        }
        toast.success("Нарачката е избришана");
        onOpenChange(false);
      } catch {
        toast.error(FAILED);
      }
    });
  }

  const footer = (
    <div className="flex flex-col gap-3">
      <Button
        type="button"
        size="lg"
        variant={done ? "secondary" : "default"}
        disabled={busy}
        onClick={toggleStatus}
        className={cn("w-full", !done && "bg-success-strong text-success-foreground hover:bg-success-strong/90 active:bg-success-strong/85")}
      >
        {statusPending ? (
          <Loader2 className="animate-spin" aria-hidden />
        ) : done ? (
          <RotateCcw aria-hidden />
        ) : (
          <Check aria-hidden />
        )}
        {done ? "Врати во нови" : "Означи како готова"}
      </Button>
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="secondary"
          size="lg"
          className="flex-1"
          disabled={busy}
          onClick={() => onEdit(order)}
        >
          <Pencil aria-hidden />
          Измени
        </Button>
        <div className="h-8 w-px shrink-0 bg-border" aria-hidden />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="lg"
              className="flex-1 text-destructive hover:bg-destructive-soft"
              disabled={busy}
            >
              {deletePending ? <Loader2 className="animate-spin" aria-hidden /> : <Trash2 aria-hidden />}
              Избриши
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Да се избрише нарачката?</AlertDialogTitle>
              <AlertDialogDescription>
                Нарачката за {order.customerName} во {order.time} ќе биде трајно избришана.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Откажи</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={handleDelete}>
                Избриши
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={onOpenChange}
      title={<span className="block type-title2 break-words">{order.customerName}</span>}
      description={
        // Badge sits on the subtitle line so long names can wrap freely.
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>
            <span className="font-semibold tabular-nums text-foreground">{order.time}</span>
            {" · "}
            {capitalize(formatLongDate(order.date))}
          </span>
          <StatusBadge status={status} />
        </span>
      }
      footer={footer}
    >
      <div className="flex flex-col gap-6 pb-2">
        {order.phone && (
          <Button asChild variant="tinted" size="lg" className="w-full justify-start">
            <a href={`tel:${order.phone.replace(/\s+/g, "")}`}>
              <Phone aria-hidden />
              Јави се
              <span className="ml-auto font-normal tabular-nums">{order.phone}</span>
            </a>
          </Button>
        )}

        <GroupedSection title="Производи">
          <GroupedCard>
            <ul className="divide-y divide-border">
              {order.items.map((item) => (
                <li key={item.id} className="flex min-h-[52px] items-start gap-3 px-4 py-3">
                  <span className="w-9 shrink-0 type-body font-semibold tabular-nums">
                    {item.quantity}×
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="type-body text-foreground">{item.label}</p>
                    {item.note && (
                      <p className="mt-0.5 type-footnote text-muted-foreground">{item.note}</p>
                    )}
                  </div>
                  <span className="shrink-0 pt-0.5 type-subhead tabular-nums">
                    {formatPrice(item.quantity * item.unitPrice)}
                  </span>
                </li>
              ))}
              <li className="flex min-h-[52px] items-center justify-between gap-3 px-4 py-3">
                <span className="type-subhead text-muted-foreground tabular-nums">
                  Вкупно · {orderPieces(order)} парч.
                </span>
                <span className="type-headline tabular-nums">{formatPrice(order.total)}</span>
              </li>
            </ul>
          </GroupedCard>
        </GroupedSection>

        {order.notes && (
          <GroupedSection title="Забелешка">
            <div className="flex gap-3 rounded-2xl bg-warning-soft px-4 py-3 text-warning-foreground">
              <StickyNote className="mt-px size-5 shrink-0" aria-hidden />
              <p className="type-body whitespace-pre-wrap">{order.notes}</p>
            </div>
          </GroupedSection>
        )}
      </div>
    </ResponsiveSheet>
  );
}
