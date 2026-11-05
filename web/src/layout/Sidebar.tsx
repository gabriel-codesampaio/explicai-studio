import { ListFilter, PanelLeftClose, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Brand } from "@/components/Brand";
import { Kbd } from "@/components/ui/kbd";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckManualDialog } from "@/features/check/CheckManualDialog";
import { ManualSwitcher } from "@/features/manuals/ManualSwitcher";
import { RenameManualDialog } from "@/features/manuals/RenameManualDialog";
import { NewPageMenu } from "@/features/pages/NewPageMenu";
import type { PageAction } from "@/features/pages/PageActions";
import { PageTree } from "@/features/pages/PageTree";
import { useStudioContext } from "@/hooks/StudioContext";
import type { TreeItem } from "@/lib/api";
import { t } from "@/lib/i18n";
import { staleOnly } from "@/lib/reviewed";
import { templateBody } from "@/lib/templates";
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
  // "Visualizar como": a árvore mostra só o que o perfil vê no export.
  const { viewAs, setViewAs } = studio;
  const [renaming, setRenaming] = useState(false);
  const [checking, setChecking] = useState(false);
  const profile = manual?.audiences.includes(viewAs) ? viewAs : null;
  const pages = manual?.pages;
  const [onlyStale, setOnlyStale] = useState(false);
  const visible = useMemo(() => {
    const seen = pages ? visibleFor(pages, profile) : [];
    return onlyStale ? staleOnly(seen) : seen;
  }, [pages, profile, onlyStale]);
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
    <aside aria-label={t("Barra lateral")} className="flex h-full flex-col border-r border-border bg-card">
      {/* Só o miolo rola: a barra de rolagem não passa pelo rodapé. */}
      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-3 py-4 [scrollbar-gutter:stable]">
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
            onCheck={() => setChecking(true)}
          />
        )}
        {renaming && current && (
          <RenameManualDialog title={current.title} onRename={studio.renameManual} onClose={() => setRenaming(false)} />
        )}

        {checking && manual && (
          <CheckManualDialog
            slug={manual.slug}
            onOpenPage={(id) => {
              setChecking(false);
              onNavigate?.();
              void studio.selectPage(id);
            }}
            onClose={() => setChecking(false)}
          />
        )}

        {manual && (
          <nav aria-label={t("Páginas do manual")} className="grid grid-cols-1 gap-1">
            {manual.audiences.length > 0 && (
              <div className="mb-2 flex flex-col gap-1 px-2">
                <label htmlFor="ver-como" className="rotulo text-muted-foreground">
                  {t("Visualizar como")}
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
            {manual.pages.length > 0 && (
              <button
                type="button"
                aria-pressed={onlyStale}
                title={t("Páginas sem data de conferência ou conferidas há mais de 90 dias")}
                onClick={() => setOnlyStale((v) => !v)}
                className="mb-2 flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground aria-pressed:bg-accent aria-pressed:text-foreground [@media(pointer:coarse)]:min-h-11"
              >
                <ListFilter className="size-3.5" aria-hidden /> {t("Só não conferidas")}
              </button>
            )}
            <div className="mb-2 flex items-center justify-between px-2 text-[13px] text-muted-foreground">
              <span className="rotulo">{t("Páginas")}</span>
              <div className="flex items-center">
                <button
                  type="button"
                  data-passeio="nova-pagina"
                  onClick={() => {
                    onNavigate?.();
                    void studio.addPage(null);
                  }}
                  className="flex items-center gap-1 rounded-md px-1.5 py-1 font-bold text-primary hover:bg-accent"
                >
                  <Plus className="size-3.5" aria-hidden /> {t("Nova página")}
                </button>
                <NewPageMenu
                  onPick={(template) => {
                    onNavigate?.();
                    void studio.addPage(null, template && templateBody(template, manual.language));
                  }}
                />
              </div>
            </div>
            {manual.pages.length === 0 ? (
              <p className="px-2 text-sm text-muted-foreground">{t("Nenhuma página ainda.")}</p>
            ) : onlyStale && visible.length === 0 ? (
              <p className="px-2 text-sm text-muted-foreground">{t("Nenhuma página pendente de conferência.")}</p>
            ) : (
              <PageTree
                pages={visible}
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
      </div>

      <MoreMenu />
    </aside>
  );
}
