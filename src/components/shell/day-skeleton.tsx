import { Skeleton } from "@/components/ui/skeleton";
import { SHOP_NAME } from "@/lib/config";

export function DaySkeleton() {
  return (
    <div className="mx-auto min-h-dvh w-full max-w-md" aria-busy="true">
      <span className="sr-only">Се вчитува…</span>
      <div className="border-b px-4 pt-3 pb-3">
        <p className="font-heading text-sm font-semibold text-primary">{SHOP_NAME}</p>
        <Skeleton className="mt-1 h-7 w-52" />
        <div className="mt-3 grid grid-cols-7 gap-1">
          {Array.from({ length: 7 }, (_, i) => (
            <Skeleton key={i} className="h-15 rounded-xl" />
          ))}
        </div>
        <Skeleton className="mt-3 h-4 w-40" />
      </div>
      <div className="flex flex-col gap-3 p-3">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-48 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
