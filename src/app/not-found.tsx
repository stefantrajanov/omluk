import { SearchXIcon } from "lucide-react";
import Link from "next/link";
import { StatusScreen } from "@/components/shell/status-screen";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Не е пронајдено" };

export default function NotFound() {
  return (
    <StatusScreen
      icon={<SearchXIcon />}
      title="Страницата не постои"
      action={
        <Button asChild size="lg">
          <Link href="/">Кон нарачките</Link>
        </Button>
      }
    >
      <p>Оваа страница не е пронајдена.</p>
    </StatusScreen>
  );
}
