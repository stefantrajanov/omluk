import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-xl border border-transparent bg-clip-padding font-medium whitespace-nowrap transition-[background-color,color,opacity,transform] duration-150 outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/40 active:not-aria-[haspopup]:scale-[0.98] active:not-aria-[haspopup]:opacity-80 disabled:pointer-events-none disabled:opacity-40 aria-invalid:ring-3 aria-invalid:ring-destructive/25 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        tinted:
          "bg-accent text-accent-foreground hover:bg-[color-mix(in_srgb,var(--accent),var(--primary)_8%)] aria-expanded:bg-[color-mix(in_srgb,var(--accent),var(--primary)_8%)]",
        outline:
          "border-input bg-card text-foreground hover:bg-background aria-expanded:bg-background",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-muted aria-expanded:bg-muted",
        ghost:
          "text-primary hover:bg-accent aria-expanded:bg-accent",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive/30",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-11 gap-2 px-4 text-[17px] has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "h-7 gap-1 rounded-lg px-2.5 text-[13px] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-9 gap-1.5 rounded-lg px-3 text-[15px] has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-4",
        lg: "h-[50px] gap-2 px-5 text-[17px] font-semibold has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        icon: "size-11",
        "icon-xs": "size-7 rounded-lg [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-9 rounded-lg [&_svg:not([class*='size-'])]:size-4",
        "icon-lg": "size-12 [&_svg:not([class*='size-'])]:size-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
