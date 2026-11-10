import { CheckIcon, ChevronRightIcon, PhoneIcon, StickyNoteIcon } from "lucide-react";
import { formatPrice, orderPieces } from "@/lib/capacity";
import type { Order } from "@/lib/orders/types";
import { pluralize, summarizeItem } from "./format";

const MAX_ITEM_LINES = 3;

type Props = {
  order: Order;
  onOpen: (order: Order) => void;
  /** Slot time shown before the name in narrow containers. */
  time?: string;
};

export function OrderCard({ order, onOpen, time }: Props) {
  if (order.status === "done") return <DoneCard order={order} onOpen={onOpen} time={time} />;
  const pieces = orderPieces(order);
  const shown = order.items.slice(0, MAX_ITEM_LINES);
  const hidden = order.items.length - shown.length;

  return (
    <button
      type="button"
      onClick={() => onOpen(order)}
      className="@container/tile relative flex w-full items-center gap-3 overflow-hidden rounded-xl border border-border bg-card py-3 pr-3 pl-4.5 text-left text-foreground transition-[filter,background-color] outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50 active:brightness-95"
    >
      <span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-primary" />

      {/* Wide tiles: meta moves to a right column on the name's baseline. */}
      <span className="flex min-w-0 flex-1 flex-col gap-1 @[520px]/tile:flex-row @[520px]/tile:items-baseline @[520px]/tile:gap-4">
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="flex min-w-0 items-baseline gap-1.5">
            {time && (
              <span className="shrink-0 type-callout font-semibold text-foreground tabular-nums @2xl/timeline:hidden">
                {time} ·
              </span>
            )}
            <span className="min-w-0 flex-1 truncate type-headline">{order.customerName}</span>
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
              <StickyNoteIcon className="size-3.5 shrink-0" aria-hidden />
              <span className="sr-only">Белешка:</span>
              <span className="truncate">{order.notes}</span>
            </span>
          )}
        </span>

        <span className="mt-1 flex items-center gap-2 @[520px]/tile:mt-0 @[520px]/tile:shrink-0">
          <span className="inline-flex h-6 shrink-0 items-center rounded-full bg-muted px-2 type-caption font-semibold text-secondary-foreground tabular-nums">
            {pieces} {pluralize(pieces, "парче", "парчиња")}
          </span>
          {order.phone && (
            <span className="inline-flex items-center text-muted-foreground">
              <PhoneIcon className="size-3.5" aria-hidden />
              <span className="sr-only">Има телефон</span>
            </span>
          )}
          <span className="ml-auto shrink-0 type-subhead font-semibold tabular-nums">{formatPrice(order.total)}</span>
        </span>
      </span>

      <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
    </button>
  );
}

// Compact, green-tinted tile: two lines narrow, one row in wide tiles.
function DoneCard({ order, onOpen, time }: Props) {
  const [first, ...rest] = order.items;

  return (
    <button
      type="button"
      onClick={() => onOpen(order)}
      className="@container/tile relative flex min-h-11 w-full items-center overflow-hidden rounded-xl bg-success-soft py-2 pr-3 pl-4 text-left text-foreground transition-[filter] outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50 active:brightness-95"
    >
      <span aria-hidden className="absolute inset-y-0 left-0 w-0.75 bg-success" />

      {/* Wide: name · items · status · price in one row (order-* reflows cells). */}
      <span className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-3 gap-y-0.5 @[520px]/tile:grid-cols-[auto_minmax(0,1fr)_auto_auto]">
        <span className="flex min-w-0 items-baseline gap-1.5 @[520px]/tile:max-w-56">
          {time && (
            <span className="shrink-0 type-footnote font-semibold text-muted-foreground tabular-nums @2xl/timeline:hidden">
              {time} ·
            </span>
          )}
          <span className="min-w-0 truncate type-subhead font-semibold">{order.customerName}</span>
        </span>

        <span className="inline-flex shrink-0 items-center gap-1 justify-self-end type-footnote font-semibold text-success-strong @[520px]/tile:order-2">
          <CheckIcon className="size-4 self-center text-success" aria-hidden />
          Готова
        </span>

        <span className="flex min-w-0 items-baseline gap-1.5 type-footnote text-muted-foreground">
          <span className="min-w-0 truncate">{first && summarizeItem(first)}</span>
          {rest.length > 0 && (
            <>
              <span aria-hidden className="shrink-0 font-medium">
                + уште {rest.length}
              </span>
              <span className="sr-only">, {rest.map(summarizeItem).join(", ")}</span>
            </>
          )}
          {order.notes && (
            <>
              <StickyNoteIcon className="size-3.5 shrink-0 self-center" aria-hidden />
              <span className="sr-only">Има белешка</span>
            </>
          )}
        </span>

        <span className="justify-self-end type-footnote font-semibold tabular-nums @[520px]/tile:order-3">
          {formatPrice(order.total)}
        </span>
      </span>
    </button>
  );
}
