import { PanelLeftClose, Plus, Search } from "lucide-react";
import { Brand } from "@/components/Brand";
import { ExportDialog } from "@/features/export/ExportDialog";
import { ShortcutsDialog } from "@/features/help/ShortcutsDialog";
import { ManualSwitcher } from "@/features/manuals/ManualSwitcher";
import type { PageAction } from "@/features/pages/PageActions";
import { PageTree } from "@/features/pages/PageTree";
import { TrashPanel } from "@/features/pages/TrashPanel";
import { AppearancePanel } from "@/features/settings/AppearancePanel";
import { useStudioContext } from "@/hooks/StudioContext";
import type { TreeItem } from "@/lib/api";
import { t } from "@/lib/i18n";
import { shiftTarget } from "@/lib/tree";

interface Props {
  /** Recolhe a coluna (tela larga) ou fecha a gaveta (tela estreita). */
  onCollapse: () => void;
  /** Chamado ao abrir uma página: na gaveta, ela fecha para mostrar a página. */
  onNavigate?: () => void;
  onSearch: () => void;
}

export function Sidebar({ onCollapse, onNavigate, onSearch }: Props) {
  const studio = useStudioContext();
  const { manuals, manual, page } = studio;
  const current = manuals?.find((m) => m.slug === manual?.slug) ?? null;

  const act = (item: TreeItem, action: PageAction) => {
    if (action.kind === "addChild") {
      onNavigate?.();
      return void studio.addPage(item.id);
    }
    if (action.kind === "remove") return void studio.removePage(item);
    const to = manual && shiftTarget(manual.pages, item.id, action.shift);
    if (to) void studio.movePage(item.id, to.parentId, to.index);
  };

  return (
    <aside className="flex h-full flex-col gap-5 overflow-y-auto border-r border-border bg-card px-3 py-4">
      <div className="flex items-center justify-between gap-2">
        <Brand />
        <button
          type="button"
          onClick={onCollapse}
          aria-label={t("Esconder as páginas ({atalho})", { atalho: "Ctrl+\\" })}
          title={t("Esconder as páginas ({atalho})", { atalho: "Ctrl+\\" })}
          className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <PanelLeftClose className="size-4" aria-hidden />
        </button>
      </div>

      {manuals && manuals.length > 0 && (
        <ManualSwitcher
          manuals={manuals}
          current={current}
          onOpen={(slug) => void studio.openManual(slug)}
          onCreate={() => studio.setCreatingManual(true)}
        />
      )}
      {manual && manual.pages.length > 0 && <ExportDialog />}

      {manual && (
        <nav aria-label="Páginas do manual" className="grid gap-1">
          <button
            type="button"
            onClick={onSearch}
            className="mb-1 flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Search className="size-3.5" aria-hidden /> {t("Buscar página")}
            <kbd className="ml-auto font-mono text-[11px] text-muted-foreground">Ctrl+P</kbd>
          </button>
          <div className="flex items-center justify-between px-2 text-[13px] text-muted-foreground">
            <span className="rotulo">{t("Páginas")}</span>
            <button
              type="button"
              onClick={() => {
                onNavigate?.();
                void studio.addPage(null);
              }}
              className="flex items-center gap-1 rounded-md px-1.5 py-1 font-bold text-primary hover:bg-accent"
            >
              <Plus className="size-3.5" aria-hidden /> {t("Nova página")}
            </button>
          </div>
          {manual.pages.length === 0 ? (
            <p className="px-2 text-sm text-muted-foreground">{t("Nenhuma página ainda.")}</p>
          ) : (
            <PageTree
              pages={manual.pages}
              selectedId={page?.id ?? null}
              onSelect={(id) => {
                onNavigate?.();
                void studio.selectPage(id);
              }}
              onAction={act}
              onMove={(id, parentId, index) => void studio.movePage(id, parentId, index)}
            />
          )}
        </nav>
      )}

      <div className="mt-auto flex flex-wrap gap-1 border-t border-border pt-3">
        {manual && (
          <TrashPanel slug={manual.slug} onRestore={(trashId, pageId) => studio.restorePage(manual.slug, trashId, pageId)} />
        )}
        <AppearancePanel />
        <ShortcutsDialog />
      </div>
    </aside>
  );
}
