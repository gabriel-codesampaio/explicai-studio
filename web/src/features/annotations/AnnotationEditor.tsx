import { ArrowUpRight, Hash, Highlighter, Link2, type LucideIcon, MousePointer2, Undo2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { saveAnnotations, useAnnotations } from "@/lib/annotationStore";
import { type Annotations, type HotspotTarget, removeAnnotation, type Tool } from "@/lib/annotations";
import { errorMessage, type TreeItem } from "@/lib/api";
import { t } from "@/lib/i18n";
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
  {
    tool: "select",
    label: t("Selecionar"),
    hint: t("Clique numa marcação para selecionar e arraste para mover; Delete exclui"),
    Icon: MousePointer2,
  },
  { tool: "marker", label: t("Marcador"), hint: t("Clique onde o número deve ficar"), Icon: Hash },
  { tool: "highlight", label: t("Destaque"), hint: t("Arraste sobre o que merece atenção"), Icon: Highlighter },
  { tool: "arrow", label: t("Seta"), hint: t("Arraste do início até a ponta da seta"), Icon: ArrowUpRight },
  { tool: "hotspot", label: t("Área clicável"), hint: t("Arraste sobre a área que leva a outra página"), Icon: Link2 },
];

/** Janela de marcação de uma imagem. Trabalha num rascunho e só grava ao clicar em "Salvar marcações". */
export function AnnotationEditor({ slug, asset, src, alt, pages, onClose }: Props) {
  const saved = useAnnotations(slug, asset);
  // Enquanto nada foi mexido, o rascunho é o que está gravado.
  const [edited, setEdited] = useState<Annotations | null>(null);
  const draft = edited ?? saved;
  // Rascunhos anteriores, para o "Desfazer" (Ctrl+Z). Guarda os 50 últimos passos.
  const [past, setPast] = useState<Annotations[]>([]);
  const change = (next: Annotations) => {
    if (draft) setPast([...past.slice(-49), draft]);
    setEdited(next);
  };
  const undo = () => {
    const previous = past.at(-1);
    if (!previous) return;
    setPast(past.slice(0, -1));
    setEdited(previous);
    setSelectedId(null);
  };
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
      setError(errorMessage(err, t("Não foi possível salvar as marcações.")));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="grid max-h-[94vh] w-[min(96vw,80rem)] max-w-none grid-rows-[auto_auto_minmax(0,1fr)_auto] gap-4 sm:max-w-none"
        onOpenAutoFocus={(e) => {
          // O foco abre na ferramenta ativa, para não haver dois botões destacados ao mesmo tempo.
          e.preventDefault();
          (e.currentTarget as HTMLElement).querySelector<HTMLElement>('[aria-pressed="true"]')?.focus();
        }}
        onKeyDown={(e) => {
          const target = e.target as HTMLElement;
          if ((e.key === "Delete" || e.key === "Backspace") && selectedId && draft && !target.closest("input, select")) {
            e.preventDefault();
            change(removeAnnotation(draft, selectedId));
            setSelectedId(null);
          }
          if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !target.closest("input, select, textarea")) {
            e.preventDefault();
            undo();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-extrabold tracking-tight">{t("Marcar imagem")}</DialogTitle>
          <DialogDescription>{current?.hint}</DialogDescription>
        </DialogHeader>

        <div role="toolbar" aria-label={t("Ferramentas de marcação")} className="flex flex-wrap gap-1">
          {TOOLS.map(({ tool: id, label, Icon }) => (
            <button
              key={id}
              type="button"
              aria-pressed={tool === id}
              onClick={() => setTool(id)}
              className={cn(
                "flex h-9 items-center gap-2 rounded-md border px-3 text-sm",
                tool === id ? "border-primary bg-accent font-bold text-primary" : "border-border hover:bg-muted",
              )}
            >
              <Icon className="size-4" aria-hidden /> {label}
            </button>
          ))}
        </div>

        {draft ? (
          <div className="grid min-h-0 items-start gap-5 overflow-auto md:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="grid min-w-0 justify-items-center">
              <AnnotationCanvas
                src={src}
                alt={alt}
                annotations={draft}
                tool={tool}
                selectedId={selectedId}
                defaultTarget={defaultTarget}
                onSelect={setSelectedId}
                onChange={(next, created) => {
                  change(next);
                  setSelectedId(created);
                }}
              />
            </div>
            <AnnotationList
              annotations={draft}
              pages={pages}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onChange={change}
            />
          </div>
        ) : (
          <p className="text-muted-foreground">{t("Carregando as marcações…")}</p>
        )}

        <DialogFooter className="items-center gap-3">
          <Button variant="ghost" onClick={undo} disabled={past.length === 0} className="sm:mr-auto" title="Ctrl+Z">
            <Undo2 aria-hidden /> {t("Desfazer")}
          </Button>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <Button variant="ghost" onClick={onClose}>
            {t("Cancelar")}
          </Button>
          <Button onClick={() => void save()} disabled={!draft || saving}>
            {saving ? t("Salvando…") : t("Salvar marcações")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
