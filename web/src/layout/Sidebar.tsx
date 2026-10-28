import { Plus } from "lucide-react";
import { Brand } from "@/components/Brand";
import { ManualSwitcher } from "@/features/manuals/ManualSwitcher";
import type { PageAction } from "@/features/pages/PageActions";
import { PageTree } from "@/features/pages/PageTree";
import type { Studio } from "@/hooks/useStudio";
import type { TreeItem } from "@/lib/api";
import { shiftTarget } from "@/lib/tree";

export function Sidebar({ studio }: { studio: Studio }) {
  const { manuals, manual, page } = studio;
  const current = manuals?.find((m) => m.slug === manual?.slug) ?? null;

  const act = (item: TreeItem, action: PageAction) => {
    if (action.kind === "addChild") return void studio.addPage(item.id);
    if (action.kind === "remove") return void studio.removePage(item);
    const to = manual && shiftTarget(manual.pages, item.id, action.shift);
    if (to) void studio.movePage(item.id, to.parentId, to.index);
  };

  return (
    <aside className="flex flex-col gap-5 border-r border-border bg-card px-3 py-4 md:h-full md:overflow-y-auto">
      <Brand />

      {manuals && manuals.length > 0 && (
        <ManualSwitcher
          manuals={manuals}
          current={current}
          onOpen={(slug) => void studio.openManual(slug)}
          onCreate={() => studio.setCreatingManual(true)}
        />
      )}

      {manual && (
        <nav aria-label="Páginas do manual" className="grid gap-1">
          <div className="flex items-center justify-between px-2 text-[13px] text-muted-foreground">
            <span>Páginas</span>
            <button
              type="button"
              onClick={() => void studio.addPage(null)}
              className="flex items-center gap-1 rounded-md px-1.5 py-1 font-bold text-primary hover:bg-accent"
            >
              <Plus className="size-3.5" aria-hidden /> Nova página
            </button>
          </div>
          {manual.pages.length === 0 ? (
            <p className="px-2 text-sm text-muted-foreground">Nenhuma página ainda.</p>
          ) : (
            <PageTree
              pages={manual.pages}
              selectedId={page?.id ?? null}
              onSelect={(id) => void studio.selectPage(id)}
              onAction={act}
              onMove={(id, parentId, index) => void studio.movePage(id, parentId, index)}
            />
          )}
        </nav>
      )}
    </aside>
  );
}
