import type * as React from "react";
import { cn } from "@/lib/utils";

/** iOS grouped-form section: small header label above its content. */
export function GroupedSection({
  title,
  titleId,
  children,
  className,
}: {
  title: React.ReactNode;
  titleId?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("flex flex-col", className)}>
      <h3 id={titleId} className="mb-2 px-4 type-footnote text-muted-foreground">
        {title}
      </h3>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

export function GroupedCard({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("rounded-2xl bg-card shadow-card", className)} {...props} />;
}

export function FieldMessage({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <p id={id} role="alert" className="px-4 type-footnote text-destructive">
      {children}
    </p>
  );
}
