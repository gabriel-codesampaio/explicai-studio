import type { Editor as TiptapEditor } from "@tiptap/react";
import { ChevronRight } from "lucide-react";
import { Fragment, useState } from "react";
import { Editor } from "@/features/editor/Editor";
import { PageOutline } from "@/features/editor/PageOutline";
import { VersionsPanel } from "@/features/versions/VersionsPanel";
import type { Studio } from "@/hooks/useStudio";
import type { ManualDetail, Page } from "@/lib/api";
import { ancestorsOf } from "@/lib/tree";
import { PageTitle } from "./PageTitle";
import { StatusBar } from "./StatusBar";

interface Props {
  studio: Studio;
  manual: ManualDetail;
  page: Page;
}

export function PageView({ studio, manual, page }: Props) {
  const [editor, setEditor] = useState<TiptapEditor | null>(null);
  const [title, setTitle] = useState(page.title);
  const trail = [
    { key: manual.slug, name: manual.title },
    ...ancestorsOf(manual.pages, page.id).map((p) => ({ key: p.id, name: p.title || "Sem título" })),
  ];

  return (
    <div className="flex min-h-full flex-col">
      <div className="flex flex-1 justify-center gap-6">
        <article className="w-full max-w-[52rem] min-w-0 flex-1 px-8 pt-6 pb-24">
          <div className="flex items-center gap-3">
            <nav
              aria-label="Caminho da página"
              className="flex min-w-0 flex-1 flex-wrap items-center gap-1 text-[13px] text-muted-foreground"
            >
              {trail.map(({ key, name }, i) => (
                <Fragment key={key}>
                  {i > 0 && <ChevronRight className="size-3.5" aria-hidden />}
                  <span className="max-w-60 truncate">{name}</span>
                </Fragment>
              ))}
            </nav>
            <VersionsPanel slug={manual.slug} pageId={page.id} onSave={studio.saveVersion} onRestore={studio.restoreVersion} />
          </div>

          {/* O campo não serve de título para leitores de tela, então um h1 invisível anuncia a página. */}
          <h1 className="sr-only">{title || "Sem título"}</h1>
          <div className="mt-3 mb-3">
            <PageTitle
              initialTitle={page.title}
              onChange={(next) => {
                setTitle(next);
                studio.editPage({ title: next });
              }}
              onEnter={() => editor?.commands.focus("start")}
            />
          </div>

          <Editor
            slug={manual.slug}
            initialMarkdown={page.body}
            pages={manual.pages}
            onChange={(body) => studio.editPage({ body })}
            onError={studio.reportError}
            onReady={setEditor}
          />
        </article>
        {editor && (
          <aside className="sticky top-0 hidden max-h-svh w-56 shrink-0 self-start overflow-y-auto pt-24 pr-6 xl:block">
            <PageOutline editor={editor} />
          </aside>
        )}
      </div>
      <StatusBar
        path={`${manual.slug}/${page.file}`}
        state={studio.save.state}
        savedAt={studio.save.savedAt}
        onRetry={() => void studio.save.retry()}
      />
    </div>
  );
}
