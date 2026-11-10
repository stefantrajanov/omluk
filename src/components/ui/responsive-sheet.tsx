"use client";

import { XIcon } from "lucide-react";
import type * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";
import { MD_QUERY, useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  size?: "md" | "lg";
};

/** Bottom sheet on phones, right-side panel from `md` up. */
export function ResponsiveSheet({
  open,
  onOpenChange,
  title,
  description,
  headerAction,
  footer,
  children,
  size = "md",
}: Props): React.JSX.Element {
  const isPanel = useMediaQuery(MD_QUERY);

  return (
    <Drawer
      key={isPanel ? "panel" : "sheet"}
      open={open}
      onOpenChange={onOpenChange}
      direction={isPanel ? "right" : "bottom"}
    >
      <DrawerContent
        className={cn(
          "data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=bottom]:h-auto",
          size === "lg"
            ? "data-[vaul-drawer-direction=right]:max-w-[560px]"
            : "data-[vaul-drawer-direction=right]:max-w-[480px]",
        )}
      >
        <header className="flex shrink-0 items-start gap-3 border-b border-border bg-card px-4 pt-3 pb-3 md:px-6 md:pt-[max(1.25rem,env(safe-area-inset-top))] md:pb-4">
          <div className="min-w-0 flex-1 pt-1.5">
            <DrawerTitle className="type-title3 text-foreground">{title}</DrawerTitle>
            {description ? (
              <DrawerDescription className="mt-0.5 type-subhead text-muted-foreground">
                {description}
              </DrawerDescription>
            ) : (
              <DrawerDescription className="sr-only">{title}</DrawerDescription>
            )}
          </div>
          {headerAction ? <div className="flex shrink-0 items-center">{headerAction}</div> : null}
          <DrawerClose asChild>
            <Button
              variant="secondary"
              size="icon"
              className="-mr-1 rounded-full text-muted-foreground"
              aria-label="Затвори"
            >
              <XIcon className="size-5" strokeWidth={2.5} />
            </Button>
          </DrawerClose>
        </header>

        <div
          data-vaul-no-drag={isPanel ? true : undefined}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-background px-4 py-4 md:px-6"
        >
          {children}
        </div>

        {footer ? (
          <footer className="shrink-0 border-t border-border bg-card px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:px-6">
            {footer}
          </footer>
        ) : null}
      </DrawerContent>
    </Drawer>
  );
}
