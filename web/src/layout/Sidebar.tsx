import { Brand } from "../components/Brand";
import { ManualPicker } from "../features/manuals/ManualPicker";
import { NewManualForm } from "../features/manuals/NewManualForm";
import { PageTree } from "../features/pages/PageTree";
import type { TreeItem } from "../lib/api";
import type { Studio } from "../hooks/useStudio";

function confirmRemoval(item: TreeItem): boolean {
  const sub = item.children.length ? " e as subpáginas dela" : "";
  return window.confirm(`Excluir "${item.title}"${sub}? Essa ação não pode ser desfeita.`);
}

export function Sidebar({ studio }: { studio: Studio }) {
  const { manuals, manual, page } = studio;
  const hasManuals = (manuals?.length ?? 0) > 0;

  return (
    <aside className="sidebar">
      <Brand />

      {hasManuals && manuals && (
        <ManualPicker manuals={manuals} current={manual?.slug ?? null} onChange={(slug) => void studio.openManual(slug)} />
      )}

      {manual && (
        <nav className="pages" aria-label="Páginas do manual">
          <div className="pages-head">
            <span>Páginas</span>
            <button type="button" className="link-btn" onClick={() => void studio.addPage(null)}>
              + Nova página
            </button>
          </div>
          {manual.pages.length === 0 ? (
            <p className="muted small">Nenhuma página ainda.</p>
          ) : (
            <PageTree
              pages={manual.pages}
              selectedId={page?.id ?? null}
              onSelect={(id) => void studio.selectPage(id)}
              onAddChild={(id) => void studio.addPage(id)}
              onRemove={(item) => confirmRemoval(item) && void studio.removePage(item)}
              onMove={(id, parentId, index) => void studio.movePage(id, parentId, index)}
            />
          )}
        </nav>
      )}

      {/* A key troca quando surge o primeiro manual, para o formulário recolher sozinho. */}
      <NewManualForm key={hasManuals ? "recolhido" : "aberto"} startOpen={!hasManuals} onCreate={studio.createManual} />
    </aside>
  );
}
