"use client";

import { XIcon } from "lucide-react";
import { useLayoutEffect, useRef } from "react";
import type * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useKeyboardViewport, type KeyboardViewport } from "@/hooks/use-keyboard-viewport";
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
  /** Fixed 92dvh bottom sheet instead of content height. */
  fullHeight?: boolean;
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
  fullHeight = false,
}: Props): React.JSX.Element {
  const isPanel = useMediaQuery(MD_QUERY);
  const keyboard = useKeyboardViewport(open);
  const bodyRef = useRef<HTMLDivElement>(null);

  // Keep the focused field visible above the keyboard.
  useLayoutEffect(() => {
    const body = bodyRef.current;
    if (!keyboard || !body) return;
    const reveal = () => revealFocused(body);
    reveal();
    body.addEventListener("focusin", reveal);
    return () => body.removeEventListener("focusin", reveal);
  }, [keyboard]);

  return (
    <Drawer
      key={isPanel ? "panel" : "sheet"}
      open={open}
      onOpenChange={onOpenChange}
      direction={isPanel ? "right" : "bottom"}
      repositionInputs={false}
    >
      <DrawerContent
        style={keyboard ? keyboardStyle(keyboard, isPanel, fullHeight) : undefined}
        className={cn(
          "data-[vaul-drawer-direction=right]:w-full",
          fullHeight
            ? "data-[vaul-drawer-direction=bottom]:h-[92dvh]"
            : "data-[vaul-drawer-direction=bottom]:h-auto",
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

        {/* Drag only from the grabber/header. */}
        <div
          ref={bodyRef}
          data-vaul-no-drag=""
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-background px-4 py-4 md:px-6"
        >
          {children}
        </div>

        {footer ? (
          <footer
            data-vaul-no-drag=""
            hidden={keyboard !== null}
            className="shrink-0 border-t border-border bg-card px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:px-6"
          >
            {footer}
          </footer>
        ) : null}
      </DrawerContent>
    </Drawer>
  );
}

/** Fits the sheet to the visible area above the keyboard; the sheet top stays put. */
function keyboardStyle(
  { top, height }: KeyboardViewport,
  isPanel: boolean,
  fullHeight: boolean,
): React.CSSProperties {
  if (isPanel) return { top, bottom: "auto", height };
  // 8dvh = resting gap above the 92dvh sheet.
  const fit = `calc(${height}px - 8dvh)`;
  return {
    top: top + height,
    bottom: "auto",
    translate: "0 -100%",
    maxHeight: fit,
    height: fullHeight ? fit : undefined,
  };
}

function revealFocused(body: HTMLElement) {
  const el = document.activeElement;
  if (!(el instanceof HTMLElement) || !body.contains(el)) return;
  const gap = 16;
  const view = body.getBoundingClientRect();
  const box = el.getBoundingClientRect();
  if (box.bottom > view.bottom - gap) {
    // Tall fields align to the top instead.
    body.scrollTop += Math.min(box.bottom - view.bottom + gap, box.top - view.top - gap);
  } else if (box.top < view.top + gap) {
    body.scrollTop -= view.top + gap - box.top;
  }
}
