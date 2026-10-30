import { type ReactNode, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  title: string;
  children: ReactNode;
  action?: { label: string; onClick: () => void };
  /** Tela de erro: anuncia para o leitor de tela e leva o foco para o título. */
  alert?: boolean;
  /** Abaixo do botão: ação secundária, código do erro. */
  extra?: ReactNode;
}

export function EmptyState({ title, children, action, alert, extra }: Props) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (alert) heading.current?.focus();
  }, [alert]);

  return (
    <div role={alert ? "alert" : undefined} className="mx-auto mt-[16vh] grid max-w-lg justify-items-start gap-4 px-6">
      <h1
        ref={heading}
        tabIndex={alert ? -1 : undefined}
        className="font-display text-3xl font-extrabold tracking-tight [font-stretch:108%] text-balance outline-none"
      >
        {title}
      </h1>
      <p className="text-muted-foreground">{children}</p>
      {action && (
        <Button className="[@media(pointer:coarse)]:min-h-11" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
      {extra}
    </div>
  );
}
