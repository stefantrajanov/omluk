"use client";

import { TriangleAlertIcon } from "lucide-react";
import { useEffect } from "react";
import { StatusScreen } from "@/components/shell/status-screen";
import { Button } from "@/components/ui/button";

export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusScreen
      icon={<TriangleAlertIcon />}
      title="Нешто тргна наопаку"
      action={
        <Button size="lg" onClick={() => retry()}>
          Обиди се повторно
        </Button>
      }
    >
      <p>Страницата не можеше да се прикаже.</p>
    </StatusScreen>
  );
}
