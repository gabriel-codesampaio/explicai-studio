import { ArrowUpRight, Highlighter, Link2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { type Annotations, type HotspotTarget, removeAnnotation, updateHotspot, updateMarker } from "@/lib/annotations";
import type { TreeItem } from "@/lib/api";
import { flattenItems } from "@/lib/tree";
import { cn } from "@/lib/utils";

interface Props {
  annotations: Annotations;
  pages: TreeItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onChange: (next: Annotations) => void;
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
export function AnnotationList({ annotations, pages, selectedId, onSelect, onChange }: Props) {
  const allPages = flattenItems(pages);
  const remove = (id: string) => onChange(removeAnnotation(annotations, id));
  const setTarget = (id: string, target: HotspotTarget) => onChange(updateHotspot(annotations, id, target));
  const empty =
    annotations.markers.length + annotations.highlights.length + annotations.arrows.length + annotations.hotspots.length === 0;

  if (empty) {
    return (
      <p className="text-sm text-muted-foreground">
        Escolha uma ferramenta e clique ou arraste sobre a imagem. Cada marcador numerado ganha uma linha aqui para você escrever
        o que ele mostra.
      </p>
    );
  }

  return (
    <div className="grid content-start gap-4">
      {annotations.markers.length > 0 && (
        <section className="grid gap-1.5">
          <h3 className="text-sm font-bold">Legenda</h3>
          {[...annotations.markers]
            .sort((a, b) => a.n - b.n)
            .map((m) => (
              <div key={m.id} className={row(m.id === selectedId)} onPointerDown={() => onSelect(m.id)}>
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-anotacao font-mono text-xs font-semibold text-white">
                  {m.n}
                </span>
                <Input
                  aria-label={`O que o marcador ${m.n} mostra`}
                  value={m.label ?? ""}
                  placeholder="O que este marcador mostra?"
                  onFocus={() => onSelect(m.id)}
                  onChange={(e) => onChange(updateMarker(annotations, m.id, e.target.value))}
                  className="h-8"
                />
                <RemoveButton label={`Excluir marcador ${m.n}`} onClick={() => remove(m.id)} />
              </div>
            ))}
        </section>
      )}

      {annotations.hotspots.length > 0 && (
        <section className="grid gap-1.5">
          <h3 className="text-sm font-bold">Áreas clicáveis</h3>
          {annotations.hotspots.map((h, i) => (
            <div key={h.id} className={cn(row(h.id === selectedId), "flex-wrap")} onPointerDown={() => onSelect(h.id)}>
              <Link2 className="size-4 shrink-0 text-primary" aria-hidden />
              <select
                aria-label={`Destino da área ${i + 1}`}
                value={h.target.type === "page" ? h.target.pageId : "__url"}
                onFocus={() => onSelect(h.id)}
                onChange={(e) =>
                  setTarget(
                    h.id,
                    e.target.value === "__url" ? { type: "url", href: "https://" } : { type: "page", pageId: e.target.value },
                  )
                }
                className="h-8 min-w-0 flex-1 rounded-md border border-input bg-card px-2 text-sm"
              >
                {allPages.map((p) => (
                  <option key={p.id} value={p.id}>
                    Página: {p.title || "Sem título"}
                  </option>
                ))}
                <option value="__url">Endereço na web…</option>
              </select>
              <RemoveButton label={`Excluir área ${i + 1}`} onClick={() => remove(h.id)} />
              {h.target.type === "url" && (
                <Input
                  aria-label={`Endereço da área ${i + 1}`}
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
          <h3 className="text-sm font-bold">Destaques e setas</h3>
          {[
            ...annotations.highlights.map((h, i) => ({ id: h.id, label: `Destaque ${i + 1}`, Icon: Highlighter })),
            ...annotations.arrows.map((a, i) => ({ id: a.id, label: `Seta ${i + 1}`, Icon: ArrowUpRight })),
          ].map(({ id, label, Icon }) => (
            <div key={id} className={row(id === selectedId)}>
              <button type="button" onClick={() => onSelect(id)} className="flex flex-1 items-center gap-2 text-left text-sm">
                <Icon className="size-4 text-primary" aria-hidden /> {label}
              </button>
              <RemoveButton label={`Excluir ${label.toLowerCase()}`} onClick={() => remove(id)} />
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
