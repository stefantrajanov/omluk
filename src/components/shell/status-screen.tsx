import type { ReactNode } from "react";
import { SHOP_NAME } from "@/lib/config";

type Props = {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  action?: ReactNode;
};

/** Full-screen message for setup, error and not-found states. */
export function StatusScreen({ icon, title, children, action }: Props) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-4 px-6 py-10 text-center">
      <p className="font-heading text-sm font-semibold text-primary">{SHOP_NAME}</p>
      <div className="flex size-16 items-center justify-center rounded-full bg-secondary text-primary [&_svg]:size-8">
        {icon}
      </div>
      <h1 className="font-heading text-2xl font-bold">{title}</h1>
      <div className="text-base text-muted-foreground">{children}</div>
      {action}
    </main>
  );
}
