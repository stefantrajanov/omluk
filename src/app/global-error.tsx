"use client";

import "./globals.css";

export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="mk">
      <body>
        <title>Грешка</title>
        <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
          <h1 className="text-2xl font-bold">Нешто тргна наопаку</h1>
          <p className="text-muted-foreground">Апликацијата не можеше да се вчита.</p>
          <button
            type="button"
            onClick={() => retry()}
            className="h-12 rounded-xl bg-primary px-5 font-semibold text-primary-foreground"
          >
            Обиди се повторно
          </button>
        </main>
      </body>
    </html>
  );
}
