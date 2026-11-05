import type { Editor as TiptapEditor } from "@tiptap/react";
import { ChevronRight, Pencil } from "lucide-react";
import { Fragment, useRef, useState } from "react";
import { Editor } from "@/features/editor/Editor";
import { useHeadings } from "@/features/editor/headings";
import { PageOutline, PageOutlineButton } from "@/features/editor/PageOutline";
import { ExportDialog } from "@/features/export/ExportDialog";
import { AudienceMenu } from "@/features/pages/AudienceMenu";
import { FirstStepHint } from "@/features/pages/FirstStepHint";
import { StatusMenu } from "@/features/pages/StatusMenu";
import { ManualAppearanceDialog } from "@/features/settings/ManualAppearanceDialog";
import { PinnedNotice } from "@/features/versions/PinnedNotice";
import { VersionsPanel } from "@/features/versions/VersionsPanel";
import { useStudioContext } from "@/hooks/StudioContext";
import type { ManualDetail, Page } from "@/lib/api";
import { t } from "@/lib/i18n";
import { ancestorsOf, findItem } from "@/lib/tree";
import { cn } from "@/lib/utils";
import { FormatNewerNotice } from "./FormatNewerNotice";
import { PageTitle } from "./PageTitle";
import { StatusBar } from "./StatusBar";

interface Props {
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

export function PageView({ manual, page }: Props) {
  const studio = useStudioContext();
  const [editor, setEditor] = useState<TiptapEditor | null>(null);
  const [title, setTitle] = useState(page.title);
  const [empty, setEmpty] = useState(!page.body.trim());
  const [exportOpen, setExportOpen] = useState(false);
  const [coverOpen, setCoverOpen] = useState(false);
  const coverBtn = useRef<HTMLButtonElement>(null);
  const headings = useHeadings(editor);
  const readOnly = manual.newerFormat !== undefined;
  const pinned = Boolean(findItem(manual.pages, page.id)?.published);
  const trail = [
    { key: manual.slug, name: manual.title },
    ...ancestorsOf(manual.pages, page.id).map((p) => ({ key: p.id, name: p.title || t("Sem título") })),
  ];

  return (
    <div className="flex flex-1 flex-col">
      <div className={GRID}>
        <article
          lang={manual.language}
          className="mx-auto w-full max-w-[var(--medida)] min-w-0 px-5 pt-6 pb-24 sm:px-8 xl:col-start-2"
        >
          <div className="flex flex-wrap items-center gap-1">
            <nav
              aria-label={t("Caminho da página")}
              className="mr-2 flex min-w-0 basis-full flex-wrap items-center gap-1 text-[13px] text-muted-foreground sm:basis-0 sm:flex-1"
            >
              {trail.map(({ key, name }, i) => (
                <Fragment key={key}>
                  {i > 0 && <ChevronRight className={cn("size-3.5", i === 1 && "hidden split:block")} aria-hidden />}
                  {/* Abaixo de split o MobileBar já mostra o nome do manual: aqui ele só repetiria. */}
                  <span className={cn("max-w-60 truncate", i === 0 && "hidden split:inline")}>{name}</span>
                </Fragment>
              ))}
            </nav>
            {/* Abaixo de sm o caminho ocupa a linha inteira e o grupo desce alinhado à esquerda. */}
            <div className="flex flex-wrap items-center gap-1 sm:ml-auto sm:justify-end">
              {!readOnly && (
                <>
                  <VersionsPanel
                    slug={manual.slug}
                    pageId={page.id}
                    pinned={pinned}
                    onSave={studio.saveVersion}
                    onRestore={studio.restoreVersion}
                    onPublish={studio.publishVersion}
                  />
                  <AudienceMenu
                    key={page.id}
                    audience={page.audience ?? []}
                    known={manual.audiences}
                    onChange={(a) => studio.setPageAudience(a)}
                  />
                  <StatusMenu status={page.status} onChange={(s) => void studio.setPageStatus(s)} />
                </>
              )}
              {editor && headings.length > 0 && <PageOutlineButton editor={editor} headings={headings} />}
              {!readOnly && manual.pages.length > 0 && <ExportDialog open={exportOpen} onOpenChange={setExportOpen} />}
            </div>
          </div>

          {manual.newerFormat !== undefined && <FormatNewerNotice version={manual.newerFormat} />}
          {pinned && <PinnedNotice onUseCurrent={() => void studio.publishVersion(null)} />}

          {/* O campo não serve de título para leitores de tela, então um h1 invisível anuncia a página. */}
          <h1 className="sr-only">{title || t("Sem título")}</h1>
          <div className="group mt-3 mb-3 flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <PageTitle
                initialTitle={page.title}
                readOnly={readOnly}
                onChange={(next) => {
                  setTitle(next);
                  studio.editPage({ title: next });
                }}
                onEnter={() => editor?.commands.focus("start")}
              />
            </div>
            {!readOnly && (
              <>
                {/* Edita a capa do manual, não o título da página. Sempre ocupa o lugar: aparecer não desloca nada. */}
                <button
                  ref={coverBtn}
                  type="button"
                  aria-label={t("Editar a capa e o rodapé do manual")}
                  title={t("Editar a capa e o rodapé do manual")}
                  onClick={() => setCoverOpen(true)}
                  className="mt-1.5 inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-muted hover:text-foreground focus-visible:opacity-100 [@media(pointer:coarse)]:size-11 [@media(pointer:coarse)]:opacity-100"
                >
                  <Pencil className="size-4" aria-hidden />
                </button>
                <ManualAppearanceDialog
                  section="cover"
                  open={coverOpen}
                  onOpenChange={(open) => {
                    setCoverOpen(open);
                    // Sem gatilho dentro do Dialog: devolve o foco ao botão depois que o Radix terminar.
                    if (!open) setTimeout(() => coverBtn.current?.focus(), 0);
                  }}
                />
              </>
            )}
          </div>

          {empty && !readOnly && <FirstStepHint onExport={() => setExportOpen(true)} />}

          <Editor
            slug={manual.slug}
            initialMarkdown={page.body}
            pages={manual.pages}
            onChange={(body) => {
              setEmpty(!body.trim());
              studio.editPage({ body });
            }}
            onError={studio.reportError}
            onReady={setEditor}
            readOnly={readOnly}
          />
        </article>
        {editor && headings.length > 0 && (
          <aside
            aria-label={t("Índice da página")}
            className="sticky top-0 hidden max-h-svh w-56 self-start overflow-y-auto pt-24 pr-6 xl:block"
          >
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
