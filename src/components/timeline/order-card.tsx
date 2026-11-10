import { CheckIcon, ChevronRightIcon, PhoneIcon, StickyNoteIcon } from "lucide-react";
import { formatPrice, orderPieces } from "@/lib/capacity";
import type { Order } from "@/lib/orders/types";
import { cn } from "@/lib/utils";
import { pluralize, summarizeItem } from "./format";

const MAX_ITEM_LINES = 3;

export function OrderCard({ order, onOpen }: { order: Order; onOpen: (order: Order) => void }) {
  const done = order.status === "done";
  const pieces = orderPieces(order);
  const shown = order.items.slice(0, MAX_ITEM_LINES);
  const hidden = order.items.length - shown.length;

  return (
    <button
      type="button"
      onClick={() => onOpen(order)}
      className={cn(
        "relative flex w-full items-center gap-3 overflow-hidden rounded-xl py-3 pr-3 pl-4.5 text-left transition-[filter,background-color] outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50 active:brightness-95",
        done ? "bg-success-soft" : "bg-background",
      )}
    >
      <span aria-hidden className={cn("absolute inset-y-0 left-0 w-1", done ? "bg-success" : "bg-primary")} />

      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="flex items-baseline gap-3">
          <span className={cn("min-w-0 flex-1 truncate type-headline", done && "text-foreground/70")}>
            {order.customerName}
          </span>
          <span className="shrink-0 type-subhead font-semibold tabular-nums">{formatPrice(order.total)}</span>
        </span>

        <span className="flex flex-col type-subhead text-muted-foreground">
          {shown.map((item) => (
            <span key={item.id} className="line-clamp-2">
              {summarizeItem(item)}
            </span>
          ))}
          {hidden > 0 && <span className="font-medium">+ уште {hidden}</span>}
        </span>

        {order.notes && (
          <span className="flex min-w-0 items-center gap-1.5 type-footnote text-muted-foreground">
            <StickyNoteIcon className="size-3.5 shrink-0 text-accent-foreground" aria-hidden />
            <span className="sr-only">Белешка:</span>
            <span className="truncate">{order.notes}</span>
          </span>
        )}

        <span className="mt-1 flex flex-wrap items-center gap-2">
          <span className="inline-flex h-6 items-center rounded-full bg-muted px-2 type-caption font-semibold text-secondary-foreground tabular-nums">
            {pieces} {pluralize(pieces, "парче", "парчиња")}
          </span>
          {order.phone && (
            <span className="inline-flex items-center text-muted-foreground">
              <PhoneIcon className="size-3.5" aria-hidden />
              <span className="sr-only">Има телефон</span>
            </span>
          )}
          {done && (
            <span className="inline-flex items-center gap-1 type-footnote font-semibold text-success">
              <CheckIcon className="size-4" aria-hidden />
              Готова
            </span>
          )}
        </span>
      </span>

      <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
    </button>
  );
}
