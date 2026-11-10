import { Skeleton } from "@/components/ui/skeleton";

/** Loading placeholder mirroring the day screen at each breakpoint. */
export function DaySkeleton() {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[320px_minmax(0,1fr)]" aria-busy="true">
      <span className="sr-only">Се вчитува…</span>

      <aside className="hidden h-dvh flex-col gap-6 border-r border-border bg-card px-6 pt-6 lg:flex">
        <Skeleton className="h-10 w-44" />
        <Skeleton className="h-[50px] w-full" />
        <Skeleton className="h-[372px] w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </aside>

      <div className="min-w-0">
        <div className="sticky top-0 border-b border-border bg-background/80 pt-safe lg:hidden">
          <div className="mx-auto flex h-14 max-w-3xl items-center gap-2 px-4 md:px-6">
            <Skeleton className="h-8 w-32" />
            <div className="flex-1" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="size-8 rounded-full" />
          </div>
        </div>
        <div className="hidden border-b border-border lg:block">
          <div className="mx-auto flex max-w-5xl items-center gap-3 px-8 py-4">
            <Skeleton className="h-10 w-80" />
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 pt-4 md:px-6 md:pt-6 lg:max-w-5xl lg:px-8">
          <Skeleton className="h-9 w-64 lg:hidden" />
          <Skeleton className="h-[124px] rounded-2xl bg-card shadow-card" />
          <Skeleton className="h-20 rounded-2xl bg-card shadow-card lg:hidden" />
          <div className="mt-2 flex flex-col gap-3">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-40 rounded-2xl bg-card shadow-card" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
