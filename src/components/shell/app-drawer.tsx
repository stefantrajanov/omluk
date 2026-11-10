"use client";

import type { ReactNode } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  headerExtra?: ReactNode;
  children: ReactNode;
  className?: string;
};

/** Bottom sheet sized for phones, centered on wider screens. */
export function AppDrawer({ open, onOpenChange, title, description, headerExtra, children, className }: Props) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        className={cn(
          "mx-auto w-full max-w-md bg-popover data-[vaul-drawer-direction=bottom]:max-h-[94dvh]",
          className,
        )}
      >
        <DrawerHeader className="pt-2 pb-3 text-left md:text-left group-data-[vaul-drawer-direction=bottom]/drawer-content:text-left">
          <DrawerTitle className="font-heading text-xl font-bold">{title}</DrawerTitle>
          {description ? (
            <DrawerDescription className="text-base">{description}</DrawerDescription>
          ) : (
            <DrawerDescription className="sr-only">{title}</DrawerDescription>
          )}
          {headerExtra}
        </DrawerHeader>
        {children}
      </DrawerContent>
    </Drawer>
  );
}
