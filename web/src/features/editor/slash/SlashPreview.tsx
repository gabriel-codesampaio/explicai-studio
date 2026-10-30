import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Block } from "../blocks";

const CALLOUT_COLOR: Record<string, string> = {
  "callout-tip": "var(--aviso-tip)",
  "callout-warning": "var(--aviso-warning)",
  "callout-caution": "var(--aviso-caution)",
  "callout-note": "var(--aviso-note)",
};
const HEADING_SIZE: Record<string, string> = { h1: "text-[22px]", h2: "text-[18px]", h3: "text-[15px]" };
const mono = "font-mono text-[10px] font-bold";

/** Miniatura do resultado, desenhada com os mesmos tokens do conteúdo do manual. Sem ícone: o que aparece é o que será inserido. */
function sample(block: Block): ReactNode {
  const color = CALLOUT_COLOR[block.id];
  if (color) return <span className="h-6 w-8 rounded-[2px] border-l-4 bg-muted" style={{ borderLeftColor: color }} />;
  if (HEADING_SIZE[block.id]) {
    return <span className={cn("font-display font-bold leading-none", HEADING_SIZE[block.id])}>Aa</span>;
  }
  switch (block.id) {
    case "steps":
      return (
        <span className={cn(mono, "grid size-6 place-items-center rounded-full bg-anotacao text-[var(--sobre-anotacao)]")}>
          1
        </span>
      );
    case "result":
      return <span className={cn(mono, "bg-[linear-gradient(transparent_50%,var(--marca-faixa)_50%)] uppercase")}>OK</span>;
    case "quote":
      return <span className="h-5 border-l-2 border-border pl-1.5 text-base italic leading-5">“</span>;
    case "code":
      return <span className={cn(mono, "rounded-[4px] border border-border bg-superficie px-1")}>{"{ }"}</span>;
    case "bullets":
      return <span className="text-base font-bold leading-none">•</span>;
    case "image":
      return <span className="h-5 w-7 rounded-[3px] border-2 border-muted-foreground/60" />;
    case "table":
      return (
        <span className="size-6 border border-muted-foreground/60 bg-[linear-gradient(var(--border),var(--border))_center/1px_100%_no-repeat,linear-gradient(var(--border),var(--border))_center/100%_1px_no-repeat]" />
      );
    default:
      return <span className="text-base leading-none">Aa</span>;
  }
}

export function SlashPreview({ block }: { block: Block }) {
  return (
    <span aria-hidden className="grid h-8 w-10 shrink-0 place-items-center text-foreground">
      {sample(block)}
    </span>
  );
}
