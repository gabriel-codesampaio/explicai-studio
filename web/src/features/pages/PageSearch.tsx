import { ChevronRight, Search } from "lucide-react";
import { type KeyboardEvent, useEffect, useEffectEvent, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useStudioContext } from "@/hooks/StudioContext";
import { t } from "@/lib/i18n";
import { searchPages } from "@/lib/tree";
import { cn } from "@/lib/utils";
import { StatusDot } from "./StatusMenu";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Busca de páginas pelo título (Ctrl+P): digita, anda com as setas e abre com Enter.
 * Fica no nível do app para o atalho valer com a barra lateral recolhida ou como gaveta.
 */
export function PageSearch({ open, onOpenChange }: Props) {
  const studio = useStudioContext();
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const matches = searchPages(studio.manual?.pages ?? [], query).slice(0, 50);

  const onKey = useEffectEvent((e: globalThis.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p" && studio.manual) {
      e.preventDefault(); // no lugar de imprimir a página do Studio
      setQuery("");
      setIndex(0);
      onOpenChange(true);
    }
  });
  useEffect(() => {
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (id: string) => {
    onOpenChange(false);
    void studio.selectPage(id);
  };
  const onInputKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const step = e.key === "ArrowDown" ? 1 : -1;
      setIndex((i) => (i + step + matches.length) % Math.max(matches.length, 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const hit = matches[index];
      if (hit) go(hit.item.id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        aria-describedby={undefined}
        className="top-[12vh] translate-y-0 gap-0 overflow-hidden p-0 sm:max-w-lg"
      >
        <DialogTitle className="sr-only">{t("Buscar página")}</DialogTitle>
        <div className="flex items-center gap-2 border-b border-border px-3">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <input
            autoFocus
            role="combobox"
            aria-expanded="true"
            aria-controls="busca-resultados"
            aria-activedescendant={matches[index] ? `busca-${matches[index].item.id}` : undefined}
            aria-label={t("Buscar página pelo título")}
            placeholder={t("Buscar página pelo título…")}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIndex(0);
            }}
            onKeyDown={onInputKey}
            className="h-12 min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div
          id="busca-resultados"
          role="listbox"
          aria-label={t("Páginas encontradas")}
          className="max-h-[50vh] overflow-y-auto p-1"
        >
          {matches.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">{t("Nenhuma página com esse título.")}</p>
          )}
          {matches.map((m, i) => (
            <div
              key={m.item.id}
              id={`busca-${m.item.id}`}
              role="option"
              tabIndex={-1}
              aria-selected={i === index}
              onMouseMove={() => setIndex(i)}
              onClick={() => go(m.item.id)}
              onKeyDown={() => {}}
              className={cn("flex cursor-pointer items-center gap-2 rounded-md px-3 py-2", i === index && "bg-accent")}
            >
              <span className="grid min-w-0 flex-1 leading-tight">
                <span className="truncate text-sm font-bold">{m.item.title || t("Sem título")}</span>
                {m.path.length > 0 && (
                  <span className="flex min-w-0 items-center gap-1 truncate text-xs text-muted-foreground">
                    {m.path.map((p, j) => (
                      <span key={m.path.slice(0, j + 1).join("/")} className="flex items-center gap-1">
                        {j > 0 && <ChevronRight className="size-3" aria-hidden />}
                        {p}
                      </span>
                    ))}
                  </span>
                )}
              </span>
              {m.item.status !== "rascunho" && <StatusDot status={m.item.status} />}
              {m.item.id === studio.page?.id && <span className="text-xs text-muted-foreground">{t("aberta")}</span>}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
