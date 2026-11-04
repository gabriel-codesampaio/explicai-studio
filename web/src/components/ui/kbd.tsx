import type * as React from "react";
import { cn } from "@/lib/utils";

/** Tecla de atalho: caixinha com borda, fundo muted e mono pequeno. Decorativa por padrão; passe `aria-hidden={false}` quando for o conteúdo. */
export function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      aria-hidden
      className={cn(
        "inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-sm border border-border bg-muted px-1 font-mono text-[11px] leading-none font-medium whitespace-nowrap text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}
