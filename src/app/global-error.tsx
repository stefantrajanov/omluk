"use client";

import "./globals.css";

export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="mk">
      <body className="bg-background">
        <title>Грешка</title>
        <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-12 md:px-6">
          <div className="flex w-full max-w-md flex-col items-center gap-4 rounded-2xl bg-card px-6 py-8 text-center shadow-card">
            <h1 className="type-title2">Нешто тргна наопаку</h1>
            <p className="type-body text-muted-foreground">Апликацијата не можеше да се вчита.</p>
            <button
              type="button"
              onClick={() => retry()}
              className="mt-2 h-[50px] w-full rounded-xl bg-primary px-5 text-[17px] font-semibold text-primary-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/40 active:opacity-80"
            >
              Обиди се повторно
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
