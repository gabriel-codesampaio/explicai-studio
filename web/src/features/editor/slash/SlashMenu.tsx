import { type Ref, useImperativeHandle, useState } from "react";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { type Block, groupBlocks } from "../blocks";
import { SlashPreview } from "./SlashPreview";

interface Props {
  items: Block[];
  command: (block: Block) => void;
  ref?: Ref<SlashMenuHandle>;
}

export interface SlashMenuHandle {
  onKeyDown: (event: KeyboardEvent) => boolean;
}

/** Lista do menu "/". O teclado (setas e Enter) chega pelo `onKeyDown` exposto ao plugin de sugestão. */
export function SlashMenu({ items, command, ref }: Props) {
  const [index, setIndex] = useState(0);
  // Lista nova (outra busca) volta a seleção para o primeiro item, já nesta renderização.
  const [shown, setShown] = useState(items);
  if (items !== shown) {
    setShown(items);
    setIndex(0);
  }

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
      aria-label={t("Inserir bloco")}
      className="z-50 max-h-80 w-80 overflow-y-auto rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-[0_8px_24px_-12px_rgb(21_26_51/0.35)]"
    >
      {items.length === 0 ? (
        <p className="px-3 py-2 text-sm text-muted-foreground">{t("Nenhum bloco com esse nome.")}</p>
      ) : (
        groupBlocks(items).map((group) => (
          // biome-ignore lint/a11y/useSemanticElements: group dentro de listbox é o padrão ARIA; fieldset não cabe aí
          <div key={group.id} role="group" aria-labelledby={`slash-${group.id}`}>
            <p id={`slash-${group.id}`} className="rotulo px-2 pt-2 pb-1">
              {group.label}
            </p>
            {group.items.map((item) => {
              const i = items.indexOf(item);
              return (
                <button
                  key={item.id}
                  type="button"
                  role="option"
                  aria-selected={i === index}
                  onMouseEnter={() => setIndex(i)}
                  onClick={() => command(item)}
                  className={cn("flex w-full items-center gap-2 rounded-md px-2 py-1 text-left", i === index && "bg-accent")}
                >
                  <SlashPreview block={item} />
                  <span className="grid leading-tight">
                    <span className="text-sm font-bold">{item.label}</span>
                    <span className="text-xs text-muted-foreground">{item.hint}</span>
                  </span>
                </button>
              );
            })}
          </div>
        ))
      )}
    </div>
  );
}
