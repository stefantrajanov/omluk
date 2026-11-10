"use client";

import { useState, type ReactNode } from "react";
import { Check, Minus, Plus, ShoppingBasket, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { formatPrice } from "@/lib/capacity";
import {
  CATEGORIES,
  FILLINGS,
  MEATS,
  SIZES,
  itemLabel,
  parseProductKey,
  productKey,
  unitPrice,
  type Category,
  type Filling,
  type ItemSelection,
  type Meat,
  type Size,
} from "@/lib/menu";
import { cn } from "@/lib/utils";
import { GroupedCard } from "./grouped-section";

export type DraftItem = {
  key: string;
  productKey: string;
  label: string;
  unitPrice: number;
  quantity: number;
  note: string;
};

let draftSeq = 0;
export const newDraftKey = () => `d${++draftSeq}`;

export function addDraftItem(items: DraftItem[], sel: ItemSelection): DraftItem[] {
  const key = productKey(sel);
  const existing = items.find((i) => i.productKey === key && i.note.trim() === "");
  if (existing) {
    return items.map((i) => (i === existing ? { ...i, quantity: i.quantity + 1 } : i));
  }
  return [
    ...items,
    { key: newDraftKey(), productKey: key, label: itemLabel(sel), unitPrice: unitPrice(sel), quantity: 1, note: "" },
  ];
}

export function ItemList({
  items,
  onChange,
}: {
  items: DraftItem[];
  onChange: (items: DraftItem[]) => void;
}) {
  const update = (key: string, patch: Partial<DraftItem>) =>
    onChange(items.map((i) => (i.key === key ? { ...i, ...patch } : i)));

  if (items.length === 0) {
    return (
      <GroupedCard className="flex min-h-[52px] items-center gap-3 px-4 py-3 text-muted-foreground">
        <ShoppingBasket className="size-5 shrink-0" aria-hidden />
        <p className="type-subhead">Сè уште нема додадени производи.</p>
      </GroupedCard>
    );
  }

  return (
    <GroupedCard>
      <ul className="divide-y divide-border">
        {items.map((item) => {
          const isPizza = parseProductKey(item.productKey)?.category === "pizza";
          return (
            <li key={item.key} className="flex flex-col gap-3 py-3 pr-2 pl-4">
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="type-body text-foreground">{item.label}</p>
                  <p className="type-footnote text-muted-foreground tabular-nums">
                    {item.quantity} × {formatPrice(item.unitPrice)}
                  </p>
                </div>
                <p className="shrink-0 pt-0.5 type-subhead font-semibold tabular-nums">
                  {formatPrice(item.quantity * item.unitPrice)}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="-mt-2.5 text-destructive hover:bg-destructive-soft"
                  aria-label={`Отстрани ${item.label}`}
                  onClick={() => onChange(items.filter((i) => i.key !== item.key))}
                >
                  <Trash2 />
                </Button>
              </div>
              <div className="flex items-center gap-2 pr-2">
                <QuantityStepper
                  value={item.quantity}
                  onChange={(quantity) => update(item.key, { quantity })}
                />
                <input
                  value={item.note}
                  onChange={(e) => update(item.key, { note: e.target.value })}
                  placeholder={isPizza ? "пр. пеперони" : "Белешка за ставката"}
                  aria-label={`Белешка за ${item.label}`}
                  autoComplete="off"
                  className="h-11 min-w-0 flex-1 rounded-xl bg-background px-3 type-callout text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>
            </li>
          );
        })}
      </ul>
    </GroupedCard>
  );
}

function QuantityStepper({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <div className="flex shrink-0 items-center rounded-xl bg-background">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Намали количина"
        disabled={value <= 1}
        onClick={() => onChange(value - 1)}
      >
        <Minus />
      </Button>
      <span className="w-7 text-center type-headline tabular-nums" aria-live="polite">
        {value}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Зголеми количина"
        onClick={() => onChange(value + 1)}
      >
        <Plus />
      </Button>
    </div>
  );
}

// Cheapest option per category, for the "од … ден." hint.
const FROM_PRICE = Object.fromEntries(
  CATEGORIES.map((c) => [
    c.key,
    Math.min(
      ...SIZES.flatMap((s) =>
        c.key === "pie"
          ? FILLINGS.map((f) => unitPrice({ category: c.key, size: s.key, meat: "pork", filling: f.key }))
          : [unitPrice({ category: c.key, size: s.key })],
      ),
    ),
  ]),
) as Record<Category, number>;

// "Со кашкавал и јајца" → "Кашкавал + јајца": the field label already says what it is.
const shortFilling = (label: string) => {
  const s = label.replace(/^Со\s+/, "").replace(/\s+и\s+/, " + ");
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const toOptions = <T extends string>(list: { key: T; label: string }[], fmt = (l: string) => l) =>
  list.map((o) => ({ value: o.key, label: fmt(o.label) }));

export function ItemPicker({ onAdd }: { onAdd: (sel: ItemSelection) => void }) {
  // Choices persist between adds for fast repeat entry.
  const [category, setCategory] = useState<Category>("pie");
  const [size, setSize] = useState<Size>("large");
  const [meat, setMeat] = useState<Meat>("pork");
  const [filling, setFilling] = useState<Filling>("eggs");

  const sel: ItemSelection =
    category === "pie" ? { category, size, meat, filling } : { category, size };

  return (
    <GroupedCard className="flex flex-col gap-4 p-4">
      <div role="group" aria-label="Вид" className="grid grid-cols-2 gap-2">
        {CATEGORIES.map((c) => {
          const selected = category === c.key;
          return (
            <button
              key={c.key}
              type="button"
              aria-pressed={selected}
              onClick={() => setCategory(c.key)}
              className={cn(
                "relative flex min-h-[104px] flex-col items-start gap-0.5 rounded-xl bg-card p-3 text-left ring-inset transition-[background-color,box-shadow,transform] duration-150 outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.98]",
                selected ? "ring-2 ring-primary" : "ring-1 ring-border hover:bg-background",
              )}
            >
              {selected && (
                <span className="absolute top-2.5 right-2.5 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="size-3.5" strokeWidth={3} aria-hidden />
                </span>
              )}
              <span className="pr-6 type-subhead font-semibold text-foreground">{c.label}</span>
              {c.hint && <span className="type-caption text-muted-foreground">{c.hint}</span>}
              {/* Pinned to the bottom so prices line up across the grid. */}
              <span className="mt-auto pt-1 type-footnote text-muted-foreground tabular-nums">
                од {formatPrice(FROM_PRICE[c.key])}
              </span>
            </button>
          );
        })}
      </div>

      <Field label="Големина">
        <SegmentedControl
          aria-label="Големина"
          size="lg"
          value={size}
          onValueChange={setSize}
          options={toOptions(SIZES)}
          className={wrapLabels}
        />
      </Field>
      {category === "pie" && (
        <>
          <Field label="Месо">
            <SegmentedControl
              aria-label="Месо"
              size="lg"
              value={meat}
              onValueChange={setMeat}
              options={toOptions(MEATS)}
              className={wrapLabels}
            />
          </Field>
          <Field label="Додаток">
            <SegmentedControl
              aria-label="Додаток"
              size="lg"
              value={filling}
              onValueChange={setFilling}
              options={toOptions(FILLINGS, shortFilling)}
              className={fitLabels}
            />
          </Field>
        </>
      )}

      <div className="flex flex-col gap-3 border-t border-border pt-4">
        <div className="flex items-baseline justify-between gap-3">
          <p className="min-w-0 truncate type-subhead text-muted-foreground">{itemLabel(sel)}</p>
          <p className="shrink-0 type-headline tabular-nums">{formatPrice(unitPrice(sel))}</p>
        </div>
        <Button type="button" variant="tinted" size="lg" className="w-full" onClick={() => onAdd(sel)}>
          <Plus aria-hidden />
          Додај
        </Button>
      </div>
    </GroupedCard>
  );
}

// Long Cyrillic labels wrap instead of truncating.
const wrapLabels = "[&>button]:py-1 [&>button]:leading-tight";
// Content-sized segments keep three options on one line on phones.
const fitLabels = "[&>button]:flex-auto [&>button]:basis-auto [&>button]:px-2.5 [&>button]:text-[15px] [&>button]:whitespace-nowrap";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="type-footnote text-muted-foreground" aria-hidden>
        {label}
      </span>
      {children}
    </div>
  );
}
