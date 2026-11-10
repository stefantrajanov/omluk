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
  /** `tiles`: three stat tiles; `list`: grouped rows for the narrow sidebar. */
  layout?: "tiles" | "list";
  className?: string;
};

export function DaySummary({ totals, layout = "tiles", className }: Props) {
  const stats = [
    {
      key: "orders",
      value: String(totals.orders),
      label: pluralize(totals.orders, "нарачка", "нарачки"),
      note:
        totals.done > 0 ? `${totals.done} ${pluralize(totals.done, "готова", "готови")}` : null,
    },
    { key: "pieces", value: String(totals.pieces), label: pluralize(totals.pieces, "парче", "парчиња"), note: null },
    { key: "total", value: formatPrice(totals.total).replace(/\s*ден\.$/, ""), label: "вкупно ден.", note: null },
  ];

  if (layout === "list") {
    return (
      <dl className={cn("divide-y divide-border overflow-hidden rounded-2xl bg-background", className)}>
        {stats.map((s) => (
          <div key={s.key} className="flex min-h-[52px] items-center justify-between gap-3 px-4 py-2">
            <dt className="type-body text-foreground first-letter:uppercase">
              {s.label}
              {s.note && <span className="block type-footnote font-medium text-success">{s.note}</span>}
            </dt>
            <dd className="type-headline tabular-nums">{s.value}</dd>
          </div>
        ))}
      </dl>
    );
  }

  return (
    <dl className={cn("grid grid-cols-3 gap-3", className)}>
      {stats.map((s) => (
        <div key={s.key} className="flex flex-col rounded-2xl bg-card p-4 shadow-card md:p-5">
          <dt className="order-2 mt-0.5 truncate type-footnote text-muted-foreground">{s.label}</dt>
          <dd className="order-1 truncate text-[26px] leading-8 font-bold tracking-tight tabular-nums md:text-[28px] md:leading-[34px]">
            {s.value}
          </dd>
          {s.note && (
            <dd className="order-3 mt-1 truncate type-footnote font-semibold text-success">{s.note}</dd>
          )}
        </div>
      ))}
    </dl>
  );
}
