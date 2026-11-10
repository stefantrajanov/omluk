import type { ReactNode } from "react";
import { Logo } from "@/components/brand/logo";

type Props = {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  action?: ReactNode;
};

/** Full-screen message for setup, error and not-found states. */
export function StatusScreen({ icon, title, children, action }: Props) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-12 pt-safe md:px-6">
      <Logo variant="full" className="mb-8 h-24 w-auto text-foreground md:h-28" />
      <div className="flex w-full max-w-md flex-col items-center gap-4 rounded-2xl bg-card px-6 py-8 text-center shadow-card md:px-8">
        <div className="flex size-14 items-center justify-center rounded-full bg-accent text-accent-foreground [&_svg]:size-7">
          {icon}
        </div>
        <h1 className="type-title2 text-balance">{title}</h1>
        <div className="type-body text-pretty text-muted-foreground">{children}</div>
        {action && <div className="mt-2 flex w-full flex-col">{action}</div>}
      </div>
    </main>
  );
}
