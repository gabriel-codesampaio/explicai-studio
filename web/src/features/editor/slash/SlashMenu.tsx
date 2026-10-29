import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { cn } from "@/lib/utils";
import type { Block } from "../blocks";

interface Props {
  items: Block[];
  command: (block: Block) => void;
}

export interface SlashMenuHandle {
  onKeyDown: (event: KeyboardEvent) => boolean;
}

/** Lista do menu "/". O teclado (setas e Enter) chega pelo `onKeyDown` exposto ao plugin de sugestão. */
export const SlashMenu = forwardRef<SlashMenuHandle, Props>(function SlashMenu({ items, command }, ref) {
  const [index, setIndex] = useState(0);
  // biome-ignore lint/correctness/useExhaustiveDependencies: a lista nova (outra busca) volta a seleção para o primeiro item
  useEffect(() => setIndex(0), [items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: (event) => {
      if (event.key === "ArrowDown") {
        setIndex((i) => (i + 1) % Math.max(items.length, 1));
        return true;
      }
      if (event.key === "ArrowUp") {
        setIndex((i) => (i - 1 + items.length) % Math.max(items.length, 1));
        return true;
      }
      if (event.key === "Enter") {
        const item = items[index];
        if (item) command(item);
        return true;
      }
      return false;
    },
  }));

  return (
    <div
      role="listbox"
      aria-label="Inserir bloco"
      className="z-50 max-h-80 w-72 overflow-y-auto rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-[0_8px_24px_-12px_rgb(21_26_51/0.35)]"
    >
      {items.length === 0 ? (
        <p className="px-3 py-2 text-sm text-muted-foreground">Nenhum bloco com esse nome.</p>
      ) : (
        items.map((item, i) => (
          <button
            key={item.id}
            type="button"
            role="option"
            aria-selected={i === index}
            onMouseEnter={() => setIndex(i)}
            onClick={() => command(item)}
            className={cn("flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left", i === index && "bg-accent")}
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-md border border-border bg-background">
              <item.icon className="size-4 text-primary" aria-hidden />
            </span>
            <span className="grid leading-tight">
              <span className="text-sm font-bold">{item.label}</span>
              <span className="text-xs text-muted-foreground">{item.hint}</span>
            </span>
          </button>
        ))
      )}
    </div>
  );
});
