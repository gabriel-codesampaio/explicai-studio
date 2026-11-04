import { ArrowUpRight, Highlighter, Link2, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { styleVars } from "@/lib/annotationStyle";
import { type Annotations, type HotspotTarget, removeAnnotation, updateHotspot, updateMarker } from "@/lib/annotations";
import type { TreeItem } from "@/lib/api";
import { t } from "@/lib/i18n";
import { flattenItems } from "@/lib/tree";
import { cn } from "@/lib/utils";

interface Props {
  annotations: Annotations;
  pages: TreeItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onChange: (next: Annotations) => void;
  /** Enter num item leva o foco ao painel Estilo. */
  onOpenStyle?: () => void;
}

const row = (selected: boolean) =>
  cn("flex items-center gap-2 rounded-md border px-2 py-1.5", selected ? "border-primary bg-accent" : "border-transparent");

function RemoveButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-destructive"
    >
      <X className="size-4" />
    </button>
  );
}

/** Lista ao lado da imagem: nome de cada marcador (vira a legenda) e destino de cada área clicável. */
export function AnnotationList({ annotations, pages, selectedId, onSelect, onChange, onOpenStyle }: Props) {
  const allPages = flattenItems(pages);
  // Marcador novo leva o foco à legenda dele; Esc ali devolve o teclado ao canvas (AnnotationEditor).
  const legends = useRef(new Map<string, HTMLInputElement>());
  const seen = useRef(new Set(annotations.markers.map((m) => m.id)));
  useEffect(() => {
    const created = annotations.markers.filter((m) => !seen.current.has(m.id));
    seen.current = new Set(annotations.markers.map((m) => m.id));
    const last = created.at(-1);
    if (last) legends.current.get(last.id)?.focus();
  }, [annotations.markers]);
  const remove = (id: string) => onChange(removeAnnotation(annotations, id));
  const setTarget = (id: string, target: HotspotTarget) => onChange(updateHotspot(annotations, id, target));
  const empty =
    annotations.markers.length + annotations.highlights.length + annotations.arrows.length + annotations.hotspots.length === 0;

  if (empty) {
    return (
      <p className="text-sm text-muted-foreground">
        {t(
          "Escolha uma ferramenta e clique ou arraste sobre a imagem. Cada marcador numerado ganha uma linha aqui para você escrever o que ele mostra.",
        )}
      </p>
    );
  }

  return (
    <div className="grid content-start gap-4" style={styleVars(annotations.style, true)}>
      {annotations.markers.length > 0 && (
        <section className="grid gap-1.5">
          <h3 className="rotulo">{t("Legenda")}</h3>
          {annotations.markers.some((m) => !m.label?.trim()) && (
            <p className="px-2 text-xs text-muted-foreground">{t("Sem descrição: o print mostra só o número.")}</p>
          )}
          {[...annotations.markers]
            .sort((a, b) => a.n - b.n)
            .map((m) => (
              <div key={m.id} className={row(m.id === selectedId)} onPointerDown={() => onSelect(m.id)}>
                <span className="num-chip shrink-0 bg-anotacao text-sobre-anotacao">{m.n}</span>
                <Input
                  data-legend-input
                  ref={(el) => {
                    if (el) legends.current.set(m.id, el);
                    else legends.current.delete(m.id);
                  }}
                  aria-label={t("O que o marcador {n} mostra", { n: m.n })}
                  value={m.label ?? ""}
                  placeholder={t("O que este marcador mostra?")}
                  onFocus={() => onSelect(m.id)}
                  onKeyDown={(e) => e.key === "Enter" && onOpenStyle?.()}
                  onChange={(e) => onChange(updateMarker(annotations, m.id, e.target.value))}
                  className="h-8"
                />
                <RemoveButton label={t("Excluir marcador {n}", { n: m.n })} onClick={() => remove(m.id)} />
              </div>
            ))}
        </section>
      )}

      {annotations.hotspots.length > 0 && (
        <section className="grid gap-1.5">
          <h3 className="rotulo">{t("Áreas clicáveis")}</h3>
          {annotations.hotspots.map((h, i) => (
            <div key={h.id} className={cn(row(h.id === selectedId), "flex-wrap")} onPointerDown={() => onSelect(h.id)}>
              <Link2 className="size-4 shrink-0 text-primary" aria-hidden />
              <Select
                value={h.target.type === "page" ? h.target.pageId : "__url"}
                onValueChange={(v) =>
                  setTarget(h.id, v === "__url" ? { type: "url", href: "https://" } : { type: "page", pageId: v })
                }
              >
                <SelectTrigger
                  aria-label={t("Destino da área {n}", { n: i + 1 })}
                  onFocus={() => onSelect(h.id)}
                  className="h-8 min-w-0 flex-1 bg-card py-0"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allPages.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {t("Página: {titulo}", { titulo: p.title || t("Sem título") })}
                    </SelectItem>
                  ))}
                  <SelectItem value="__url">{t("Endereço na web…")}</SelectItem>
                </SelectContent>
              </Select>
              <RemoveButton label={t("Excluir área {n}", { n: i + 1 })} onClick={() => remove(h.id)} />
              {h.target.type === "url" && (
                <Input
                  aria-label={t("Endereço da área {n}", { n: i + 1 })}
                  value={h.target.href}
                  onChange={(e) => setTarget(h.id, { type: "url", href: e.target.value })}
                  className="h-8 basis-full"
                />
              )}
            </div>
          ))}
        </section>
      )}

      {annotations.highlights.length + annotations.arrows.length > 0 && (
        <section className="grid gap-1.5">
          <h3 className="rotulo">{t("Destaques e setas")}</h3>
          {[
            ...annotations.highlights.map((h, i) => ({ id: h.id, label: t("Destaque {n}", { n: i + 1 }), Icon: Highlighter })),
            ...annotations.arrows.map((a, i) => ({ id: a.id, label: t("Seta {n}", { n: i + 1 }), Icon: ArrowUpRight })),
          ].map(({ id, label, Icon }) => (
            <div key={id} className={row(id === selectedId)}>
              <button
                type="button"
                onClick={(e) => {
                  onSelect(id);
                  // detail 0 = ativado pelo teclado (Enter); clique de mouse não rouba o foco.
                  if (e.detail === 0) onOpenStyle?.();
                }}
                className="flex flex-1 items-center gap-2 text-left text-sm"
              >
                <Icon className="size-4 text-primary" aria-hidden /> {label}
              </button>
              <RemoveButton label={t("Excluir {nome}", { nome: label.toLowerCase() })} onClick={() => remove(id)} />
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
