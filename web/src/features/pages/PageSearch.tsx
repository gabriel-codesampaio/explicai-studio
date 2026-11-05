import { ChevronRight, Search } from "lucide-react";
import { type KeyboardEvent, useEffect, useEffectEvent, useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useStudioContext } from "@/hooks/StudioContext";
import { t } from "@/lib/i18n";
import { searchPages } from "@/lib/tree";
import { cn } from "@/lib/utils";
import { StatusLabel } from "./StatusMenu";
import { MIN_TEXT_QUERY, useTextSearch } from "./useTextSearch";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Busca de páginas (Ctrl+P): pelo título e, a partir de 2 letras, pelo texto. Digita, anda com as setas e abre com Enter.
 * Fica no nível do app para o atalho valer com a barra lateral recolhida ou como gaveta.
 */
export function PageSearch({ open, onOpenChange }: Props) {
  const studio = useStudioContext();
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const opener = useRef<Element | null>(null); // quem tinha o foco antes de abrir: Esc devolve o teclado a ele (T-528)
  const matches = searchPages(studio.manual?.pages ?? [], query).slice(0, 50);
  const text = useTextSearch(studio.manual?.slug, query);
  // Uma lista só para as setas: títulos primeiro, depois os trechos do texto.
  const rows = [
    ...matches.map((m) => ({ id: m.item.id, dom: `busca-${m.item.id}` })),
    ...text.hits.map((h) => ({ id: h.id, dom: `busca-texto-${h.id}` })),
  ];
  const count = rows.length;
  // Os trechos do texto chegam depois de digitar e mudam a lista: o índice nunca passa do fim.
  const active = Math.min(index, Math.max(count - 1, 0));
  const wait = text.loading && count === 0;

  const onKey = useEffectEvent((e: globalThis.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p" && studio.manual) {
      e.preventDefault(); // no lugar de imprimir a página do Studio
      setQuery("");
      setIndex(0);
      onOpenChange(true);
    }
  });
  // O foco muda para o campo da busca ao abrir; por isso guardamos o último foco de fora enquanto ela está fechada.
  const onFocusIn = useEffectEvent((e: FocusEvent) => {
    if (!open) opener.current = e.target as Element;
  });
  useEffect(() => {
    window.addEventListener("keydown", onKey);
    document.addEventListener("focusin", onFocusIn);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("focusin", onFocusIn);
    };
  }, []);

  // O resultado ativo (pelas setas ou pelo mouse) fica à vista; o item já visível não rola.
  const activeDom = rows[active]?.dom;
  useEffect(() => {
    if (activeDom) document.getElementById(activeDom)?.scrollIntoView({ block: "nearest" });
  }, [activeDom]);

  const go = (id: string) => {
    onOpenChange(false);
    void studio.selectPage(id);
  };
  const onInputKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const step = e.key === "ArrowDown" ? 1 : -1;
      setIndex((active + step + count) % Math.max(count, 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const hit = rows[active];
      if (hit) go(hit.id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        aria-describedby={undefined}
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          const el = opener.current;
          // Se o ponto de origem sumiu (ex.: a página trocou), cai no texto, não no início do documento.
          const back = el instanceof HTMLElement && el.isConnected ? el : document.querySelector<HTMLElement>(".ProseMirror");
          (back ?? document.body).focus();
        }}
        className="top-[12vh] translate-y-0 gap-0 overflow-hidden p-0 sm:max-w-lg"
      >
        <DialogTitle className="sr-only">{t("Buscar página")}</DialogTitle>
        <p role="status" className="sr-only">
          {wait
            ? t("Buscando…")
            : count === 0
              ? t("Nenhum resultado.")
              : count === 1
                ? t("1 resultado")
                : t("{n} resultados", { n: count })}
        </p>
        <div className="flex items-center gap-2 border-b border-border px-3">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <input
            autoFocus
            role="combobox"
            aria-expanded={count > 0}
            aria-controls={count > 0 ? "busca-resultados" : undefined}
            aria-activedescendant={activeDom}
            aria-label={t("Buscar por título ou texto")}
            placeholder={t("Buscar por título ou texto…")}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIndex(0);
            }}
            onKeyDown={onInputKey}
            className="h-12 min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
          />
        </div>
        {count === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">
            {wait
              ? t("Buscando…")
              : query.trim().length < MIN_TEXT_QUERY
                ? t("Nenhuma página com esse título.")
                : t("Nenhum resultado.")}
          </p>
        ) : (
          <div
            id="busca-resultados"
            role="listbox"
            aria-label={t("Páginas encontradas")}
            className="max-h-[50vh] overflow-y-auto p-1"
          >
            {matches.length > 0 && (
              // biome-ignore lint/a11y/useSemanticElements: group dentro de listbox; fieldset não vale aqui
              <div role="group" aria-label={t("Por título")}>
                {matches.map((m, i) => (
                  <div
                    key={m.item.id}
                    id={`busca-${m.item.id}`}
                    role="option"
                    tabIndex={-1}
                    aria-selected={i === active}
                    onMouseMove={() => setIndex(i)}
                    onClick={() => go(m.item.id)}
                    onKeyDown={() => {}}
                    className={cn("flex cursor-pointer items-center gap-2 rounded-md px-3 py-2", i === active && "bg-accent")}
                  >
                    {m.number && (
                      <span aria-hidden className="shrink-0 font-mono text-xs tabular-nums text-primary">
                        {m.number}
                      </span>
                    )}
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
                    {m.item.status !== "rascunho" && <StatusLabel status={m.item.status} className="text-xs font-medium" />}
                    {m.item.id === studio.page?.id && <span className="text-xs text-muted-foreground">{t("aberta")}</span>}
                  </div>
                ))}
              </div>
            )}
            {text.hits.length > 0 && (
              // biome-ignore lint/a11y/useSemanticElements: group dentro de listbox; fieldset não vale aqui
              <div role="group" aria-labelledby="busca-no-texto">
                <p id="busca-no-texto" aria-hidden className="px-3 pb-1 pt-3 text-xs font-medium text-muted-foreground">
                  {t("No texto")}
                </p>
                {text.hits.map((h, j) => {
                  const i = matches.length + j;
                  return (
                    <div
                      key={h.id}
                      id={`busca-texto-${h.id}`}
                      role="option"
                      tabIndex={-1}
                      aria-selected={i === active}
                      onMouseMove={() => setIndex(i)}
                      onClick={() => go(h.id)}
                      onKeyDown={() => {}}
                      className={cn(
                        "grid min-h-11 cursor-pointer gap-0.5 rounded-md px-3 py-2 leading-tight",
                        i === active && "bg-accent",
                      )}
                    >
                      <span className="truncate text-sm font-bold">{h.title || t("Sem título")}</span>
                      <span className="line-clamp-2 text-xs text-muted-foreground">
                        {h.before}
                        <mark className="rounded-sm bg-primary/20 px-0.5 text-foreground">{h.match}</mark>
                        {h.after}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
