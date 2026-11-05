import { ArrowUpRight, Crop, EyeOff, Hash, Highlighter, Link2, type LucideIcon, MousePointer2, Undo2 } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";
import { saveAnnotations, useAnnotations } from "@/lib/annotationStore";
import {
  draftChanged,
  findItem,
  type HotspotTarget,
  nudge,
  removeAnnotation,
  type Tool,
  updateItemStyle,
} from "@/lib/annotations";
import { api, errorMessage, type TreeItem } from "@/lib/api";
import { t, tn } from "@/lib/i18n";
import { readRedactStyle, saveRedactStyle } from "@/lib/redact";
import { TOOL_KEYS, toolForKey } from "@/lib/toolShortcuts";
import { flattenItems } from "@/lib/tree";
import { cn } from "@/lib/utils";
import { AnnotationCanvas, type Draft } from "./AnnotationCanvas";
import { AnnotationList } from "./AnnotationList";
import { AppearancePanel } from "./AppearancePanel";
import { CropPanel } from "./CropPanel";
import { ItemStylePanel } from "./ItemStylePanel";
import { Pending } from "./Pending";
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
  { tool: "marker", label: t("Marcador"), hint: t("Clique onde o número deve ficar. Ou Tab, setas e Enter."), Icon: Hash },
  {
    tool: "highlight",
    label: t("Destaque"),
    hint: t("Arraste sobre o que merece atenção. Ou Tab, setas e Enter."),
    Icon: Highlighter,
  },
  {
    tool: "arrow",
    label: t("Seta"),
    hint: t("Arraste do início até a ponta da seta. Ou Tab, setas e Enter."),
    Icon: ArrowUpRight,
  },
  {
    tool: "hotspot",
    label: t("Área clicável"),
    hint: t("Arraste sobre a área que leva a outra página. Ou Tab, setas e Enter."),
    Icon: Link2,
  },
  { tool: "redact", label: t("Ocultar"), hint: t("Arraste sobre o dado que deve sumir. Ou Tab, setas e Enter."), Icon: EyeOff },
  {
    tool: "crop",
    label: t("Recortar"),
    hint: t("Arraste sobre a parte da imagem que deve ficar. Ou Tab, setas e Enter."),
    Icon: Crop,
  },
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
  // Sair com mudança não salva (ou áreas a ocultar ainda não aplicadas) perderia trabalho em silêncio: pergunta antes.
  const [leaving, setLeaving] = useState(false);
  const requestClose = () => (draft && draftChanged(draft, saved) ? setLeaving(true) : onClose());
  const [inGit, setInGit] = useState(false);
  const [gitError, setGitError] = useState(false);
  const [gitRev, setGitRev] = useState(0);
  const [redactStyle, setRedactStyle] = useState(readRedactStyle);
  // Sem a resposta, o aviso de histórico do git some em silêncio: por isso mostramos o erro e deixamos tentar de novo.
  // biome-ignore lint/correctness/useExhaustiveDependencies: `gitRev` refaz a consulta no "Tentar de novo" (o slug não muda).
  useEffect(() => {
    let live = true;
    setGitError(false);
    api
      .inGitRepo(slug)
      .then((r) => live && setInGit(r.git))
      .catch(() => live && setGitError(true));
    return () => {
      live = false;
    };
  }, [slug, gitRev]);
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
  const selectedItem = draft && selectedId ? findItem(draft.ann, selectedId) : null;
  const itemName = selectedItem
    ? selectedItem.n
      ? `${t("Marcador")} ${selectedItem.n}`
      : { arrow: t("Seta"), highlight: t("Destaque"), hotspot: t("Área clicável"), marker: t("Marcador") }[selectedItem.kind]
    : "";
  const current = TOOLS.find((t) => t.tool === tool) ?? TOOLS[0];

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    setError(null);
    try {
      await saveAnnotations(slug, asset, draft.ann);
      // Marcações já gravadas; só áreas a ocultar/recortar pendentes ainda pedem confirmação.
      if (draft.redact.length > 0 || draft.crop.length > 0) setLeaving(true);
      else onClose();
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
        onEscapeKeyDown={(e) => {
          // Esc no painel Estilo ou numa legenda devolve o foco ao canvas em vez de fechar a janela.
          const target = e.target as HTMLElement | null;
          if (!target?.closest("[data-style-panel], [data-legend-input]")) return;
          e.preventDefault();
          document.querySelector<HTMLElement>("[data-annotation-canvas]")?.focus();
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
          if (selectedId && draft && !target.closest("input, select, textarea, [role=toolbar]")) {
            const moved = nudge(draft.ann, selectedId, e.key, e.shiftKey);
            if (moved) {
              e.preventDefault();
              change({ ann: moved, redact: draft.redact, crop: draft.crop });
            }
          }
          if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !target.closest("input, select, textarea")) {
            e.preventDefault();
            undo();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-extrabold tracking-tight">{t("Editar imagem")}</DialogTitle>
          <DialogDescription className="sr-only">{current?.hint}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-1.5">
          <div role="toolbar" aria-label={t("Ferramentas de marcação")} className="flex flex-wrap items-center gap-1">
            {TOOLS.map(({ tool: id, label, Icon }) => (
              <Fragment key={id}>
                {id === "redact" && (
                  <span className="mx-1 flex items-center gap-2 self-stretch border-l border-border pl-2">
                    <span className="rotulo">{t("Altera a imagem")}</span>
                  </span>
                )}
                <button
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
                  <Kbd>{TOOL_KEYS[id]}</Kbd>
                </button>
              </Fragment>
            ))}
          </div>
          {/* Mesma dica do DialogDescription (lida por leitor de tela); aqui é a versão visível, junto da barra. */}
          <p aria-hidden className="text-sm text-muted-foreground">
            {current?.hint}
          </p>
          {gitError && (
            <div role="alert" className="flex flex-wrap items-center gap-2 text-sm text-destructive">
              <span>
                {t("Não foi possível verificar se a pasta está no git. Os avisos sobre o histórico podem não aparecer.")}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setGitRev((n) => n + 1)}
                className="[@media(pointer:coarse)]:h-11"
              >
                {t("Tentar de novo")}
              </Button>
            </div>
          )}
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
            <div className="grid min-w-0 grid-cols-1 content-start gap-4">
              <div className="order-last md:order-first">
                {selectedItem ? (
                  <ItemStylePanel
                    kind={selectedItem.kind}
                    name={itemName}
                    style={selectedItem.style}
                    imageStyle={draft.ann.style}
                    onChange={(style) => change({ ...draft, ann: updateItemStyle(draft.ann, selectedId ?? "", style) })}
                    onDelete={() => {
                      change({ ...draft, ann: removeAnnotation(draft.ann, selectedId ?? "") });
                      setSelectedId(null);
                    }}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">{t("Clique numa marcação para dar um estilo só a ela.")}</p>
                )}
              </div>
              {(tool === "redact" || draft.redact.length > 0) && (
                <Pending
                  open={tool === "redact"}
                  title={t("Ocultar dados")}
                  status={tn(draft.redact.length, "{n} área a ocultar", "{n} áreas a ocultar")}
                  onToggle={() => setTool(tool === "redact" ? "select" : "redact")}
                >
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
                </Pending>
              )}
              {(tool === "crop" || draft.crop.length > 0) && (
                <Pending
                  open={tool === "crop"}
                  title={t("Recortar imagem")}
                  status={draft.crop.length > 0 ? t("Recorte pendente") : t("Sem recorte")}
                  onToggle={() => setTool(tool === "crop" ? "select" : "crop")}
                >
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
                </Pending>
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
                onOpenStyle={() => setTimeout(() => document.querySelector<HTMLElement>("[data-style-panel]")?.focus())}
              />
              <details className="rounded-md border border-border p-3">
                <summary className="cursor-pointer rounded-md text-sm font-bold focus-visible:ring-[3px] focus-visible:ring-ring/50">
                  {t("Padrão da imagem")}
                </summary>
                <div className="mt-3">
                  <AppearancePanel
                    style={draft.ann.style}
                    onChange={(style) => {
                      const { style: _old, ...rest } = draft.ann;
                      change({ ...draft, ann: style ? { ...rest, style } : rest });
                    }}
                  />
                </div>
              </details>
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
          title={draft?.redact.length ? t("Sair sem ocultar?") : t("Descartar as alterações?")}
          confirmLabel={t("Sair e descartar")}
          cancelLabel={t("Continuar editando")}
          onConfirm={onClose}
          onCancel={() => setLeaving(false)}
        >
          <p>
            {draft?.redact.length
              ? t(
                  "As áreas a ocultar ainda não foram aplicadas. Se você sair, elas se perdem e o print continua com os dados à mostra.",
                )
              : t("Você mudou as marcações e não salvou. Se sair, as mudanças se perdem.")}
          </p>
        </ConfirmDialog>
      )}
    </Dialog>
  );
}
