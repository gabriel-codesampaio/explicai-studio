import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  title: string;
  children: ReactNode;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ title, children, action }: Props) {
  return (
    <div className="mx-auto mt-[16vh] grid max-w-lg justify-items-start gap-4 px-6">
      <h1 className="font-display text-3xl font-extrabold tracking-tight [font-stretch:108%] text-balance">{title}</h1>
      <p className="text-muted-foreground">{children}</p>
      {action && <Button onClick={action.onClick}>{action.label}</Button>}
    </div>
  );
}
