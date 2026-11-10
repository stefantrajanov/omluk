import type { Metadata, Viewport } from "next";
import { Toaster } from "@/components/ui/sonner";
import { SHOP_NAME } from "@/lib/config";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: `Нарачки · ${SHOP_NAME}`, template: `%s · ${SHOP_NAME}` },
  description: `Распоред на нарачки за ${SHOP_NAME}.`,
  applicationName: SHOP_NAME,
  appleWebApp: { capable: true, title: "Омлук", statusBarStyle: "default" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#efeff4",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="mk" className="h-full antialiased">
      <body className="min-h-full bg-background">
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
