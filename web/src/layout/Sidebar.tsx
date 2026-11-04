import { PanelLeftClose, Plus, Search } from "lucide-react";
import { useState } from "react";
import { Brand } from "@/components/Brand";
import { Kbd } from "@/components/ui/kbd";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ManualSwitcher } from "@/features/manuals/ManualSwitcher";
import { RenameManualDialog } from "@/features/manuals/RenameManualDialog";
import type { PageAction } from "@/features/pages/PageActions";
import { PageTree } from "@/features/pages/PageTree";
import { useStudioContext } from "@/hooks/StudioContext";
import type { TreeItem } from "@/lib/api";
import { t } from "@/lib/i18n";
import { shiftTarget, visibleFor } from "@/lib/tree";
import { MoreMenu } from "./MoreMenu";

interface Props {
  /** Recolhe a coluna (tela larga) ou fecha a gaveta (tela estreita). */
  onCollapse: () => void;
  /** Chamado ao abrir uma página: na gaveta, ela fecha para mostrar a página. */
  onNavigate?: () => void;
  onSearch: () => void;
}

// O Radix não aceita value "" em item: esta sentinela fica só aqui; o valor de fora segue "".
const TODOS = "__todos__";

export function Sidebar({ onCollapse, onNavigate, onSearch }: Props) {
  const studio = useStudioContext();
  const { manuals, manual, page } = studio;
  // "Ver como público": a árvore mostra só o que o perfil vê no export. Não muda nada no disco.
  const [viewAs, setViewAs] = useState("");
  const [renaming, setRenaming] = useState(false);
  const profile = manual?.audiences.includes(viewAs) ? viewAs : null;
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
    <aside className="flex h-full flex-col gap-5 overflow-y-auto border-r border-border bg-card px-3 pt-4">
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
          onRename={() => setRenaming(true)}
        />
      )}
      {renaming && current && (
        <RenameManualDialog title={current.title} onRename={studio.renameManual} onClose={() => setRenaming(false)} />
      )}

      {manual && (
        <nav aria-label={t("Páginas do manual")} className="grid grid-cols-1 gap-1">
          {manual.audiences.length > 0 && (
            <div className="mb-2 flex flex-col gap-1 px-2">
              <label htmlFor="ver-como" className="rotulo text-muted-foreground">
                {t("Ver como público")}
              </label>
              <Select value={profile || TODOS} onValueChange={(v) => setViewAs(v === TODOS ? "" : v)}>
                <SelectTrigger id="ver-como" className="w-full px-1.5 py-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TODOS}>{t("Todos")}</SelectItem>
                  {manual.audiences.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <button
            type="button"
            onClick={onSearch}
            className="mb-3 flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Search className="size-3.5" aria-hidden /> {t("Buscar página")}
            <Kbd className="ml-auto">Ctrl+P</Kbd>
          </button>
          <div className="mb-2 flex items-center justify-between px-2 text-[13px] text-muted-foreground">
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
              pages={visibleFor(manual.pages, profile)}
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

      <MoreMenu />
    </aside>
  );
}
