import { pluralize } from "@/components/timeline/format";
import { formatPrice } from "@/lib/capacity";
import { cn } from "@/lib/utils";

export type DayTotals = {
  orders: number;
  pieces: number;
  done: number;
  total: number;
};

type Props = {
  totals: DayTotals;
  /** `tiles`: one card of three columns; `list`: grouped rows for the narrow sidebar. */
  layout?: "tiles" | "list";
  className?: string;
};

export function DaySummary({ totals, layout = "tiles", className }: Props) {
  const done =
    totals.done > 0 ? `${totals.done} ${pluralize(totals.done, "готова", "готови")}` : null;
  const stats = [
    { key: "orders", value: String(totals.orders), unit: null, label: pluralize(totals.orders, "нарачка", "нарачки"), done },
    { key: "pieces", value: String(totals.pieces), unit: null, label: pluralize(totals.pieces, "парче", "парчиња"), done: null },
    { key: "total", value: formatPrice(totals.total).replace(/\s*ден\.$/, ""), unit: "ден.", label: "вкупно", done: null },
  ];

  if (layout === "list") {
    return (
      <dl className={cn("divide-y divide-border overflow-hidden rounded-2xl bg-background", className)}>
        {stats.map((s) => (
          <div key={s.key} className="flex min-h-[52px] items-center justify-between gap-3 px-4 py-2">
            <dt className="type-body text-foreground first-letter:uppercase">
              {s.label}
              {s.done && <span className="block type-footnote font-medium text-success-strong">{s.done}</span>}
            </dt>
            <dd className="shrink-0 type-headline whitespace-nowrap tabular-nums">
              {s.value}
              {s.unit && <span className="font-normal text-muted-foreground"> {s.unit}</span>}
            </dd>
          </div>
        ))}
      </dl>
    );
  }

  return (
    <dl
      className={cn(
        "grid grid-cols-3 divide-x divide-border rounded-2xl bg-card py-2.5 shadow-card md:py-4",
        className,
      )}
    >
      {stats.map((s) => (
        <div key={s.key} className="flex min-w-0 flex-col px-3 md:px-5">
          <dt className="order-2 mt-0.5 type-footnote break-words text-muted-foreground">
            {s.label}
            {s.unit && ` ${s.unit}`}
            {/* Own line on phones; inline with a "·" only from md. */}
            {s.done && (
              <span className="block font-semibold whitespace-nowrap text-success-strong md:inline">
                <span className="hidden md:inline"> · </span>
                {s.done}
              </span>
            )}
          </dt>
          {/* Unit lives in the label so the number always fits. */}
          <dd className="order-1 text-[22px] leading-[26px] font-bold tracking-tight whitespace-nowrap tabular-nums md:text-[26px] md:leading-8">
            {s.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
