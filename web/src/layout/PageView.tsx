import { Editor } from "../features/editor/Editor";
import type { SaveState } from "../hooks/useAutosave";
import type { ManualDetail, Page, PagePatch } from "../lib/api";

const SAVE_LABEL: Record<SaveState, string> = {
  idle: "",
  saving: "Salvando…",
  saved: "Salvo",
  error: "Erro ao salvar",
};

interface Props {
  manual: ManualDetail;
  page: Page;
  saveState: SaveState;
  onEdit: (patch: PagePatch) => void;
  onError: (message: string) => void;
}

export function PageView({ manual, page, saveState, onEdit, onError }: Props) {
  return (
    <article className="page">
      <header className="page-head">
        <span className="crumb">{manual.title}</span>
        <span className={`save save-${saveState}`} aria-live="polite">
          {SAVE_LABEL[saveState]}
        </span>
      </header>
      <input
        className="page-title"
        aria-label="Título da página"
        defaultValue={page.title}
        placeholder="Título da página"
        onChange={(e) => {
          if (e.target.value.trim()) onEdit({ title: e.target.value });
        }}
      />
      <Editor slug={manual.slug} initialMarkdown={page.body} onChange={(body) => onEdit({ body })} onError={onError} />
    </article>
  );
}
