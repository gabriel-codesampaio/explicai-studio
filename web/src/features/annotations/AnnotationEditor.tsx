import { ArrowUpRight, Hash, Highlighter, Link2, type LucideIcon, MousePointer2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { saveAnnotations, useAnnotations } from "@/lib/annotationStore";
import { type Annotations, type HotspotTarget, removeAnnotation, type Tool } from "@/lib/annotations";
import { errorMessage, type TreeItem } from "@/lib/api";
import { flattenItems } from "@/lib/tree";
import { cn } from "@/lib/utils";
import { AnnotationCanvas } from "./AnnotationCanvas";
import { AnnotationList } from "./AnnotationList";

interface Props {
  slug: string;
  asset: string;
  src: string;
  alt: string;
  pages: TreeItem[];
  onClose: () => void;
}

const TOOLS: { tool: Tool; label: string; hint: string; Icon: LucideIcon }[] = [
  { tool: "select", label: "Selecionar", hint: "Clique numa marcação para selecionar; Delete exclui", Icon: MousePointer2 },
  { tool: "marker", label: "Marcador", hint: "Clique onde o número deve ficar", Icon: Hash },
  { tool: "highlight", label: "Destaque", hint: "Arraste sobre o que merece atenção", Icon: Highlighter },
  { tool: "arrow", label: "Seta", hint: "Arraste do início até a ponta da seta", Icon: ArrowUpRight },
  { tool: "hotspot", label: "Área clicável", hint: "Arraste sobre a área que leva a outra página", Icon: Link2 },
];

/** Janela de marcação de uma imagem. Trabalha num rascunho e só grava ao clicar em "Salvar marcações". */
export function AnnotationEditor({ slug, asset, src, alt, pages, onClose }: Props) {
  const saved = useAnnotations(slug, asset);
  // Enquanto nada foi mexido, o rascunho é o que está gravado.
  const [edited, setDraft] = useState<Annotations | null>(null);
  const draft = edited ?? saved;
  const [tool, setTool] = useState<Tool>("marker");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const firstPage = flattenItems(pages)[0];
  const defaultTarget: HotspotTarget = firstPage ? { type: "page", pageId: firstPage.id } : { type: "url", href: "https://" };
  const current = TOOLS.find((t) => t.tool === tool) ?? TOOLS[0];

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    setError(null);
    try {
      await saveAnnotations(slug, asset, draft);
      onClose();
    } catch (err) {
      setError(errorMessage(err, "Não foi possível salvar as marcações."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="grid max-h-[94vh] w-[min(96vw,80rem)] max-w-none grid-rows-[auto_auto_minmax(0,1fr)_auto] gap-4 sm:max-w-none"
        onKeyDown={(e) => {
          const target = e.target as HTMLElement;
          if ((e.key === "Delete" || e.key === "Backspace") && selectedId && draft && !target.closest("input, select")) {
            e.preventDefault();
            setDraft(removeAnnotation(draft, selectedId));
            setSelectedId(null);
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-extrabold tracking-tight">Marcar imagem</DialogTitle>
          <DialogDescription>{current?.hint}</DialogDescription>
        </DialogHeader>

        <div role="toolbar" aria-label="Ferramentas de marcação" className="flex flex-wrap gap-1">
          {TOOLS.map(({ tool: t, label, Icon }) => (
            <button
              key={t}
              type="button"
              aria-pressed={tool === t}
              onClick={() => setTool(t)}
              className={cn(
                "flex h-9 items-center gap-2 rounded-md border px-3 text-sm",
                tool === t ? "border-primary bg-accent font-bold text-primary" : "border-border hover:bg-muted",
              )}
            >
              <Icon className="size-4" aria-hidden /> {label}
            </button>
          ))}
        </div>

        {draft ? (
          <div className="grid min-h-0 gap-5 overflow-auto md:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="min-w-0">
              <AnnotationCanvas
                src={src}
                alt={alt}
                annotations={draft}
                tool={tool}
                selectedId={selectedId}
                defaultTarget={defaultTarget}
                onSelect={setSelectedId}
                onChange={(next, created) => {
                  setDraft(next);
                  setSelectedId(created);
                }}
              />
            </div>
            <AnnotationList
              annotations={draft}
              pages={pages}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onChange={setDraft}
            />
          </div>
        ) : (
          <p className="text-muted-foreground">Carregando as marcações…</p>
        )}

        <DialogFooter className="items-center gap-3">
          {error && (
            <p role="alert" className="mr-auto text-sm text-destructive">
              {error}
            </p>
          )}
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={() => void save()} disabled={!draft || saving}>
            {saving ? "Salvando…" : "Salvar marcações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
