"use client";

import { useOptimistic, useState, useTransition } from "react";
import { Check, Loader2, Pencil, Phone, StickyNote, Trash2 } from "lucide-react";
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
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { formatPrice, orderPieces } from "@/lib/capacity";
import { formatLongDate } from "@/lib/dates";
import { deleteOrder, setOrderStatus } from "@/lib/orders/actions";
import type { Order, OrderStatus } from "@/lib/orders/types";
import { cn } from "@/lib/utils";

const FAILED = "Нешто тргна наопаку. Обидете се повторно.";

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

  return (
    <Drawer open={order !== null} onOpenChange={onOpenChange}>
      <DrawerContent className="data-[vaul-drawer-direction=bottom]:max-h-[94dvh]">
        {shown ? (
          <OrderDetailsBody key={shown.id} order={shown} onOpenChange={onOpenChange} onEdit={onEdit} />
        ) : (
          <DrawerTitle className="sr-only">Нарачка</DrawerTitle>
        )}
      </DrawerContent>
    </Drawer>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge
      className={cn(
        "h-7 px-3 text-sm",
        status === "done"
          ? "bg-success text-success-foreground"
          : "bg-warning-soft text-warning-foreground",
      )}
    >
      {status === "done" ? "Готова" : "Нова"}
    </Badge>
  );
}

function OrderDetailsBody({
  order,
  onOpenChange,
  onEdit,
}: {
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

  return (
    <>
      <DrawerHeader className="gap-1 pt-2 pb-3 text-left md:text-left">
        <div className="flex items-start justify-between gap-3">
          <DrawerTitle className="text-2xl leading-tight font-semibold break-words">
            {order.customerName}
          </DrawerTitle>
          <StatusBadge status={status} />
        </div>
        <DrawerDescription className="text-base">
          <span className="font-semibold tabular-nums text-foreground">{order.time}</span>
          {" · "}
          <span className="first-letter:uppercase">{formatLongDate(order.date)}</span>
        </DrawerDescription>
      </DrawerHeader>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-4 pb-4">
        {order.phone && (
          <Button asChild variant="secondary" size="lg" className="w-full justify-start">
            <a href={`tel:${order.phone.replace(/\s+/g, "")}`}>
              <Phone aria-hidden />
              Јави се
              <span className="ml-auto font-normal tabular-nums">{order.phone}</span>
            </a>
          </Button>
        )}

        <ul className="flex flex-col divide-y rounded-xl border bg-card">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-start justify-between gap-3 px-3 py-3">
              <div className="min-w-0">
                <p className="text-base leading-snug">
                  <span className="font-semibold tabular-nums">{item.quantity} ×</span> {item.label}
                </p>
                {item.note && <p className="text-sm text-muted-foreground">{item.note}</p>}
              </div>
              <p className="shrink-0 tabular-nums">{formatPrice(item.quantity * item.unitPrice)}</p>
            </li>
          ))}
        </ul>

        {order.notes && (
          <div className="flex gap-2 rounded-xl bg-warning-soft px-3 py-3 text-warning-foreground">
            <StickyNote className="mt-0.5 size-5 shrink-0" aria-hidden />
            <p className="text-base whitespace-pre-wrap">{order.notes}</p>
          </div>
        )}

        <Separator />
        <div className="flex items-baseline justify-between">
          <p className="text-muted-foreground tabular-nums">{orderPieces(order)} парч.</p>
          <p className="text-xl font-semibold tabular-nums">{formatPrice(order.total)}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t bg-popover px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <Button
          type="button"
          size="lg"
          aria-pressed={done}
          disabled={busy}
          onClick={toggleStatus}
          className={cn(
            "w-full",
            done
              ? "bg-success text-success-foreground hover:bg-success/85"
              : "border-success bg-background text-success hover:bg-success-soft",
          )}
        >
          {statusPending ? <Loader2 className="animate-spin" aria-hidden /> : <Check aria-hidden />}
          {done ? "Готова" : "Означи како готова"}
          {done && <span className="sr-only"> (допрете за враќање во нова)</span>}
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button type="button" variant="outline" size="lg" disabled={busy} onClick={() => onEdit(order)}>
            <Pencil aria-hidden />
            Измени
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="destructive" size="lg" disabled={busy}>
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
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/85"
                  onClick={handleDelete}
                >
                  Избриши
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </>
  );
}
