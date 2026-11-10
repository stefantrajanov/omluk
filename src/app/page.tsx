import { DatabaseIcon, WifiOffIcon } from "lucide-react";
import { connection } from "next/server";
import { Suspense } from "react";
import { DayScreen } from "@/components/shell/day-screen";
import { DaySkeleton } from "@/components/shell/day-skeleton";
import { StatusScreen } from "@/components/shell/status-screen";
import { Button } from "@/components/ui/button";
import { isValidISODate, todayISO, weekDates } from "@/lib/dates";
import { getOrderCounts, getOrdersForDate, SchemaMissingError } from "@/lib/orders/queries";
import type { Order } from "@/lib/orders/types";

export default function Page({ searchParams }: PageProps<"/">) {
  return (
    <Suspense fallback={<DaySkeleton />}>
      <DayLoader searchParams={searchParams} />
    </Suspense>
  );
}

type Loaded =
  | { status: "ok"; orders: Order[]; counts: Record<string, number> }
  | { status: "setup" }
  | { status: "error" };

async function load(date: string): Promise<Loaded> {
  const week = weekDates(date);
  try {
    const [orders, counts] = await Promise.all([
      getOrdersForDate(date),
      getOrderCounts(week[0], week[6]).catch((error: unknown) => {
        if (error instanceof SchemaMissingError) throw error;
        console.error(error);
        return {};
      }),
    ]);
    return { status: "ok", orders, counts };
  } catch (error) {
    if (error instanceof SchemaMissingError) return { status: "setup" };
    console.error(error);
    return { status: "error" };
  }
}

async function DayLoader({ searchParams }: Pick<PageProps<"/">, "searchParams">) {
  const { d } = await searchParams;
  // Read the clock at request time, never during prerender.
  await connection();
  const today = todayISO();
  const date = typeof d === "string" && isValidISODate(d) ? d : today;
  const result = await load(date);

  if (result.status === "setup") {
    return (
      <StatusScreen icon={<DatabaseIcon />} title="Базата не е подготвена">
        <p>Табелите за нарачки уште не се креирани.</p>
        <p className="mt-2">
          Применете ја миграцијата <code className="rounded-md bg-muted px-1.5 py-0.5 type-footnote text-foreground">supabase/migrations/0001_init.sql</code> во
          Supabase и освежете ја страницата.
        </p>
      </StatusScreen>
    );
  }

  if (result.status === "error") {
    return (
      <StatusScreen
        icon={<WifiOffIcon />}
        title="Нарачките не се вчитаа"
        action={
          <Button asChild size="lg">
            <a href={`/?d=${date}`}>Обиди се повторно</a>
          </Button>
        }
      >
        <p>Проверете ја интернет врската и обидете се повторно.</p>
      </StatusScreen>
    );
  }

  return <DayScreen date={date} today={today} orders={result.orders} weekCounts={result.counts} />;
}
