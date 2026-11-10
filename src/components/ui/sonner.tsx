"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      containerAriaLabel="Известувања"
      icons={{
        success: <CircleCheckIcon className="size-5 text-success" />,
        info: <InfoIcon className="size-5" />,
        warning: <TriangleAlertIcon className="size-5 text-warning" />,
        error: <OctagonXIcon className="size-5 text-destructive" />,
        loading: <Loader2Icon className="size-5 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius-2xl)",
        } as React.CSSProperties
      }
      toastOptions={{
        closeButtonAriaLabel: "Затвори",
        classNames: {
          toast: "cn-toast text-[15px] shadow-float",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
