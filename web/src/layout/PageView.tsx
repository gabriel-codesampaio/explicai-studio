import { Editor } from "@/features/editor/Editor";
import type { Studio } from "@/hooks/useStudio";
import type { ManualDetail, Page } from "@/lib/api";

interface Props {
  studio: Studio;
  manual: ManualDetail;
  page: Page;
}

const SAVE_LABEL = { idle: "", saving: "Salvando…", saved: "Salvo", error: "Erro ao salvar" } as const;

export function PageView({ studio, manual, page }: Props) {
  return (
    <article className="page">
      <header className="page-head">
        <span className="crumb">{manual.title}</span>
        <span className="save" aria-live="polite">
          {SAVE_LABEL[studio.save.state]}
        </span>
      </header>
      <input
        className="page-title"
        aria-label="Título da página"
        defaultValue={page.title}
        placeholder="Sem título"
        onChange={(e) => studio.editPage({ title: e.target.value })}
      />
      <Editor
        slug={manual.slug}
        initialMarkdown={page.body}
        onChange={(body) => studio.editPage({ body })}
        onError={studio.reportError}
      />
    </article>
  );
}
