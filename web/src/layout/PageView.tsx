import type { Editor as TiptapEditor } from "@tiptap/react";
import { ChevronRight } from "lucide-react";
import { Fragment, useState } from "react";
import { Editor } from "@/features/editor/Editor";
import { useHeadings } from "@/features/editor/headings";
import { PageOutline, PageOutlineButton } from "@/features/editor/PageOutline";
import { PinnedNotice } from "@/features/versions/PinnedNotice";
import { VersionsPanel } from "@/features/versions/VersionsPanel";
import type { Studio } from "@/hooks/useStudio";
import type { ManualDetail, Page } from "@/lib/api";
import { ancestorsOf, findItem } from "@/lib/tree";
import { PageTitle } from "./PageTitle";
import { StatusBar } from "./StatusBar";

interface Props {
  studio: Studio;
  manual: ManualDetail;
  page: Page;
}

/*
 * Três colunas a partir de xl: margem, texto e índice. O texto fica no centro e o índice encosta nele,
 * em vez de flutuar longe. Em tela grande a coluna cresce (--medida) para prints e tabelas; os
 * parágrafos continuam numa largura boa de ler (ver editor-content.css).
 */
const GRID =
  "grid flex-1 [--medida:52rem] 2xl:[--medida:60rem] min-[1920px]:[--medida:68rem] xl:grid-cols-[minmax(0,1fr)_minmax(0,var(--medida))_minmax(14rem,1fr)]";

export function PageView({ studio, manual, page }: Props) {
  const [editor, setEditor] = useState<TiptapEditor | null>(null);
  const [title, setTitle] = useState(page.title);
  const headings = useHeadings(editor);
  const pinned = Boolean(findItem(manual.pages, page.id)?.published);
  const trail = [
    { key: manual.slug, name: manual.title },
    ...ancestorsOf(manual.pages, page.id).map((p) => ({ key: p.id, name: p.title || "Sem título" })),
  ];

  return (
    <div className="flex flex-1 flex-col">
      <div className={GRID}>
        <article className="mx-auto w-full max-w-[var(--medida)] min-w-0 px-5 pt-6 pb-24 sm:px-8 xl:col-start-2">
          <div className="flex flex-wrap items-center gap-1">
            <nav
              aria-label="Caminho da página"
              className="mr-2 flex min-w-0 basis-full flex-wrap items-center gap-1 text-[13px] text-muted-foreground sm:basis-0 sm:flex-1"
            >
              {trail.map(({ key, name }, i) => (
                <Fragment key={key}>
                  {i > 0 && <ChevronRight className="size-3.5" aria-hidden />}
                  <span className="max-w-60 truncate">{name}</span>
                </Fragment>
              ))}
            </nav>
            {editor && headings.length > 0 && <PageOutlineButton editor={editor} headings={headings} />}
            <VersionsPanel
              slug={manual.slug}
              pageId={page.id}
              pinned={pinned}
              onSave={studio.saveVersion}
              onRestore={studio.restoreVersion}
              onPublish={studio.publishVersion}
            />
          </div>

          {pinned && <PinnedNotice onUseCurrent={() => void studio.publishVersion(null)} />}

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
        {editor && headings.length > 0 && (
          <aside className="sticky top-0 hidden max-h-svh w-56 self-start overflow-y-auto pt-24 pr-6 xl:block">
            <PageOutline editor={editor} headings={headings} />
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
