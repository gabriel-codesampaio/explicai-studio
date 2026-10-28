import type { Editor as TiptapEditor } from "@tiptap/react";
import { ChevronRight } from "lucide-react";
import { Fragment, useCallback, useRef, useState } from "react";
import { Editor } from "@/features/editor/Editor";
import type { Studio } from "@/hooks/useStudio";
import type { ManualDetail, Page } from "@/lib/api";
import { ancestorsOf } from "@/lib/tree";
import { StatusBar } from "./StatusBar";

interface Props {
  studio: Studio;
  manual: ManualDetail;
  page: Page;
}

export function PageView({ studio, manual, page }: Props) {
  const editorRef = useRef<TiptapEditor | null>(null);
  const onReady = useCallback((ed: TiptapEditor) => {
    editorRef.current = ed;
  }, []);
  const [title, setTitle] = useState(page.title);
  const trail = [manual.title, ...ancestorsOf(manual.pages, page.id).map((p) => p.title || "Sem título")];

  return (
    <div className="flex min-h-full flex-col">
      <article className="mx-auto w-full max-w-[52rem] flex-1 px-8 pt-6 pb-24">
        <nav aria-label="Caminho da página" className="flex flex-wrap items-center gap-1 text-[13px] text-muted-foreground">
          {trail.map((name, i) => (
            <Fragment key={i}>
              {i > 0 && <ChevronRight className="size-3.5" aria-hidden />}
              <span className="max-w-60 truncate">{name}</span>
            </Fragment>
          ))}
        </nav>

        {/* O campo não serve de título para leitores de tela, então um h1 invisível anuncia a página. */}
        <h1 className="sr-only">{title || "Sem título"}</h1>
        <div className="mt-3 mb-3">
          <input
            aria-label="Título da página"
            defaultValue={page.title}
            placeholder="Sem título"
            autoFocus={page.title === ""}
            onChange={(e) => {
              setTitle(e.target.value);
              studio.editPage({ title: e.target.value });
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                editorRef.current?.commands.focus("start");
              }
            }}
            className="w-full bg-transparent font-display text-[2.125rem] leading-tight font-extrabold tracking-tight [font-stretch:105%] outline-none placeholder:text-muted-foreground/70"
          />
        </div>

        <Editor
          slug={manual.slug}
          initialMarkdown={page.body}
          onChange={(body) => studio.editPage({ body })}
          onError={studio.reportError}
          onReady={onReady}
        />
      </article>
      <StatusBar
        path={`${manual.slug}/${page.file}`}
        state={studio.save.state}
        savedAt={studio.save.savedAt}
        onRetry={() => void studio.save.retry()}
      />
    </div>
  );
}
