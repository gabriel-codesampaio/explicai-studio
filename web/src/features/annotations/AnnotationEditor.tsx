import { ArrowUpRight, Crop, EyeOff, Hash, Highlighter, Link2, type LucideIcon, MousePointer2, Undo2 } from "lucide-react";
import { useEffect, useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { saveAnnotations, useAnnotations } from "@/lib/annotationStore";
import { type HotspotTarget, removeAnnotation, type Tool } from "@/lib/annotations";
import { api, errorMessage, type TreeItem } from "@/lib/api";
import { t } from "@/lib/i18n";
import { readRedactStyle, saveRedactStyle } from "@/lib/redact";
import { TOOL_KEYS, toolForKey } from "@/lib/toolShortcuts";
import { flattenItems } from "@/lib/tree";
import { cn } from "@/lib/utils";
import { AnnotationCanvas, type Draft } from "./AnnotationCanvas";
import { AnnotationList } from "./AnnotationList";
import { AppearancePanel } from "./AppearancePanel";
import { CropPanel } from "./CropPanel";
import { RedactPanel } from "./RedactPanel";
import { ReducePanel } from "./ReducePanel";

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
  { tool: "redact", label: t("Ocultar"), hint: t("Arraste sobre o dado que deve sumir"), Icon: EyeOff },
  { tool: "crop", label: t("Recortar"), hint: t("Arraste sobre a parte da imagem que deve ficar"), Icon: Crop },
];

/** Janela de marcação de uma imagem. Trabalha num rascunho e só grava ao clicar em "Salvar marcações". */
export function AnnotationEditor({ slug, asset, src, alt, pages, onClose }: Props) {
  const saved = useAnnotations(slug, asset);
  // Enquanto nada foi mexido, o rascunho é o que está gravado.
  const [edited, setEdited] = useState<Draft | null>(null);
  const draft = edited ?? (saved ? { ann: saved, redact: [], crop: [] } : null);
  // Rascunhos anteriores, para o "Desfazer" (Ctrl+Z). Guarda os 50 últimos passos.
  const [past, setPast] = useState<Draft[]>([]);
  const change = (next: Draft) => {
    if (draft) setPast([...past.slice(-49), draft]);
    setEdited(next);
  };
  // Sair com áreas a ocultar ainda não aplicadas perderia a proteção em silêncio: pergunta antes.
  const [leaving, setLeaving] = useState(false);
  const requestClose = () => (draft?.redact.length ? setLeaving(true) : onClose());
  const [inGit, setInGit] = useState(false);
  const [redactStyle, setRedactStyle] = useState(readRedactStyle);
  useEffect(() => {
    api
      .inGitRepo(slug)
      .then((r) => setInGit(r.git))
      .catch(() => {});
  }, [slug]);
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
      await saveAnnotations(slug, asset, draft.ann);
      requestClose();
    } catch (err) {
      setError(errorMessage(err, t("Não foi possível salvar as marcações.")));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && requestClose()}>
      <DialogContent
        className="grid max-h-[94vh] w-[min(96vw,80rem)] p-4 sm:p-6 max-w-none grid-rows-[auto_auto_minmax(0,1fr)_auto] gap-4 sm:max-w-none"
        onOpenAutoFocus={(e) => {
          // O foco abre na ferramenta ativa, para não haver dois botões destacados ao mesmo tempo.
          e.preventDefault();
          (e.currentTarget as HTMLElement).querySelector<HTMLElement>('[aria-pressed="true"]')?.focus();
        }}
        onKeyDown={(e) => {
          const target = e.target as HTMLElement;
          const shortcut = toolForKey(e);
          if (shortcut) {
            e.preventDefault();
            setTool(shortcut);
            return;
          }
          if ((e.key === "Delete" || e.key === "Backspace") && selectedId && draft && !target.closest("input, select")) {
            e.preventDefault();
            change({
              ann: removeAnnotation(draft.ann, selectedId),
              redact: draft.redact.filter((r) => r.id !== selectedId),
              crop: draft.crop.filter((r) => r.id !== selectedId),
            });
            setSelectedId(null);
          }
          if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !target.closest("input, select, textarea")) {
            e.preventDefault();
            undo();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-extrabold tracking-tight">{t("Editar imagem")}</DialogTitle>
          <DialogDescription>{current?.hint}</DialogDescription>
        </DialogHeader>

        <div role="toolbar" aria-label={t("Ferramentas de marcação")} className="flex flex-wrap gap-1">
          {TOOLS.map(({ tool: id, label, Icon }) => (
            <button
              key={id}
              type="button"
              aria-pressed={tool === id}
              aria-keyshortcuts={TOOL_KEYS[id]}
              title={`${label} (${TOOL_KEYS[id]})`}
              onClick={() => setTool(id)}
              className={cn(
                "flex h-9 items-center gap-1.5 rounded-md border px-2.5 text-sm [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:min-w-11",
                tool === id ? "border-primary bg-accent font-bold text-primary" : "border-border hover:bg-muted",
              )}
            >
              <Icon className="size-4" aria-hidden />
              {/* O nome vem deste texto; a letra é só dica, anunciada por aria-keyshortcuts (WCAG 2.5.3). */}
              <span className="sr-only sm:not-sr-only [@media(pointer:coarse)]:not-sr-only">{label}</span>
              <kbd className="font-mono text-xs" aria-hidden>
                {TOOL_KEYS[id]}
              </kbd>
            </button>
          ))}
        </div>

        {draft ? (
          <div className="grid min-h-0 items-start gap-5 overflow-auto md:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="grid min-w-0 justify-items-center">
              <AnnotationCanvas
                src={src}
                alt={alt}
                draft={draft}
                tool={tool}
                selectedId={selectedId}
                defaultTarget={defaultTarget}
                redactStyle={redactStyle}
                onSelect={setSelectedId}
                onChange={(next, created) => {
                  change(next);
                  setSelectedId(created);
                }}
              />
            </div>
            <div className="grid content-start gap-4">
              {(tool === "redact" || draft.redact.length > 0) && (
                <RedactPanel
                  slug={slug}
                  asset={asset}
                  src={src}
                  rects={draft.redact}
                  inGit={inGit}
                  style={redactStyle}
                  onStyle={(s) => {
                    saveRedactStyle(s);
                    setRedactStyle(s);
                  }}
                  onDiscard={() => {
                    change({ ...draft, redact: [] });
                    setSelectedId(null);
                  }}
                  onApplied={() => {
                    // Já virou pixel: não há o que desfazer nem listar.
                    setPast([]);
                    setEdited({ ...draft, redact: [] });
                    setSelectedId(null);
                  }}
                />
              )}
              {(tool === "crop" || draft.crop.length > 0) && (
                <CropPanel
                  slug={slug}
                  asset={asset}
                  src={src}
                  annotations={draft.ann}
                  crop={draft.crop}
                  hasRedactions={draft.redact.length > 0}
                  inGit={inGit}
                  onDiscard={() => {
                    change({ ...draft, crop: [] });
                    setSelectedId(null);
                  }}
                  onApplied={(ann) => {
                    // Já virou pixel e as marcações vão para o disco: não há o que desfazer.
                    setPast([]);
                    setEdited({ ann, redact: [], crop: [] });
                    setSelectedId(null);
                  }}
                />
              )}
              <ReducePanel
                slug={slug}
                asset={asset}
                src={src}
                pending={draft.redact.length > 0 || draft.crop.length > 0}
                inGit={inGit}
                onApplied={() => setPast([])}
              />
              <AnnotationList
                annotations={draft.ann}
                pages={pages}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onChange={(ann) => change({ ...draft, ann })}
              />
              <AppearancePanel
                style={draft.ann.style}
                onChange={(style) => {
                  const { style: _old, ...rest } = draft.ann;
                  change({ ...draft, ann: style ? { ...rest, style } : rest });
                }}
              />
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">{t("Carregando as marcações…")}</p>
        )}

        <DialogFooter className="flex-row flex-wrap items-center justify-end gap-2 sm:gap-3">
          <Button variant="ghost" onClick={undo} disabled={past.length === 0} className="mr-auto" title="Ctrl+Z">
            <Undo2 aria-hidden /> <span className="sr-only sm:not-sr-only">{t("Desfazer")}</span>
          </Button>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <Button variant="ghost" onClick={requestClose}>
            {t("Cancelar")}
          </Button>
          <Button onClick={() => void save()} disabled={!draft || saving}>
            {saving ? t("Salvando…") : t("Salvar marcações")}
          </Button>
        </DialogFooter>
      </DialogContent>
      {leaving && (
        <ConfirmDialog
          title={t("Sair sem ocultar?")}
          confirmLabel={t("Sair e descartar")}
          cancelLabel={t("Continuar editando")}
          onConfirm={onClose}
          onCancel={() => setLeaving(false)}
        >
          <p>
            {t(
              "As áreas a ocultar ainda não foram aplicadas. Se você sair, elas se perdem e o print continua com os dados à mostra.",
            )}
          </p>
        </ConfirmDialog>
      )}
    </Dialog>
  );
}
