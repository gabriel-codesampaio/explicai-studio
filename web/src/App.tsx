import { useCallback, useEffect, useRef, useState } from "react";
import { api, type ManualDetail, type ManualSummary, type Page, type TreeItem } from "./api";
import { Editor } from "./Editor";
import { findItem, PageTree } from "./PageTree";

type SaveState = "idle" | "saving" | "saved" | "error";

/** Rota no hash: #/<manual>/<página>. Assim o recarregar volta para o mesmo lugar. */
function readHash(): { slug: string | null; pageId: string | null } {
  const [slug, pageId] = window.location.hash.replace(/^#\/?/, "").split("/").map(decodeURIComponent);
  return { slug: slug || null, pageId: pageId || null };
}

function writeHash(slug: string | null, pageId: string | null) {
  const next = slug ? `#/${encodeURIComponent(slug)}${pageId ? `/${pageId}` : ""}` : "#/";
  if (window.location.hash !== next) window.history.replaceState(null, "", next);
}

export function App() {
  const [manuals, setManuals] = useState<ManualSummary[] | null>(null);
  const [manual, setManual] = useState<ManualDetail | null>(null);
  const [page, setPage] = useState<Page | null>(null);
  const [save, setSave] = useState<SaveState>("idle");
  const [error, setError] = useState<string | null>(null);

  // Salvamento com atraso: guarda o último pedido e grava 600 ms depois da última tecla.
  const pending = useRef<{ slug: string; id: string; patch: { title?: string; body?: string } } | null>(null);
  const timer = useRef<number | undefined>(undefined);

  const flush = useCallback(async () => {
    window.clearTimeout(timer.current);
    const job = pending.current;
    pending.current = null;
    if (!job) return;
    setSave("saving");
    try {
      await api.updatePage(job.slug, job.id, job.patch);
      setSave(pending.current ? "saving" : "saved");
    } catch (err) {
      setSave("error");
      setError(err instanceof Error ? err.message : "Não foi possível salvar.");
    }
  }, []);

  const queue = useCallback(
    (slug: string, id: string, patch: { title?: string; body?: string }) => {
      const same = pending.current && pending.current.id === id ? pending.current.patch : {};
      pending.current = { slug, id, patch: { ...same, ...patch } };
      setSave("saving");
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => void flush(), 600);
    },
    [flush],
  );

  useEffect(() => {
    const beforeUnload = (e: BeforeUnloadEvent) => {
      if (pending.current) {
        void flush();
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [flush]);

  const fail = (err: unknown) => setError(err instanceof Error ? err.message : String(err));

  const openManual = useCallback(
    async (slug: string, pageId: string | null) => {
      await flush();
      const detail = await api.getManual(slug);
      setManual(detail);
      const target = (pageId && findItem(detail.pages, pageId)?.id) || detail.pages[0]?.id || null;
      setPage(target ? await api.getPage(slug, target) : null);
      writeHash(slug, target);
    },
    [flush],
  );

  useEffect(() => {
    api
      .listManuals()
      .then(async (list) => {
        setManuals(list);
        const { slug, pageId } = readHash();
        const start = list.find((m) => m.slug === slug) ?? list[0];
        if (start) await openManual(start.slug, start.slug === slug ? pageId : null);
      })
      .catch(fail);
  }, [openManual]);

  const refreshTree = async (slug: string) => setManual(await api.getManual(slug));

  const selectPage = async (id: string) => {
    if (!manual || id === page?.id) return;
    await flush();
    try {
      setPage(await api.getPage(manual.slug, id));
      writeHash(manual.slug, id);
    } catch (err) {
      fail(err);
    }
  };

  const addPage = async (parentId: string | null) => {
    if (!manual) return;
    await flush();
    try {
      const created = await api.addPage(manual.slug, "Nova página", parentId);
      await refreshTree(manual.slug);
      setPage(created);
      writeHash(manual.slug, created.id);
    } catch (err) {
      fail(err);
    }
  };

  const removePage = async (item: TreeItem) => {
    if (!manual) return;
    const sub = item.children.length ? " e as subpáginas dela" : "";
    if (!window.confirm(`Excluir "${item.title}"${sub}? Essa ação não pode ser desfeita.`)) return;
    if (pending.current?.id === item.id) pending.current = null;
    try {
      await api.removePage(manual.slug, item.id);
      const detail = await api.getManual(manual.slug);
      setManual(detail);
      if (page && !findItem(detail.pages, page.id)) {
        const next = detail.pages[0]?.id;
        setPage(next ? await api.getPage(manual.slug, next) : null);
        writeHash(manual.slug, next ?? null);
      }
    } catch (err) {
      fail(err);
    }
  };

  const movePage = async (id: string, parentId: string | null, index: number) => {
    if (!manual) return;
    try {
      await api.movePage(manual.slug, id, parentId, index);
      await refreshTree(manual.slug);
    } catch (err) {
      fail(err);
    }
  };

  const createManual = async (title: string) => {
    try {
      const created = await api.createManual(title, "pt-BR");
      setManuals(await api.listManuals());
      await openManual(created.slug, null);
    } catch (err) {
      fail(err);
    }
  };

  const renameInTree = (items: TreeItem[], id: string, title: string): TreeItem[] =>
    items.map((i) => (i.id === id ? { ...i, title } : { ...i, children: renameInTree(i.children, id, title) }));

  if (manuals === null) return <div className="boot">{error ?? "Abrindo o Studio…"}</div>;

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand" role="img" aria-label="Explicaí Studio">
          <img src="/favicon.svg" alt="" width="28" height="28" />
          <span className="wordmark" aria-hidden="true">explica<span className="i">ı</span></span>
          <span className="sub" aria-hidden="true">studio</span>
        </div>

        {manuals.length > 0 && (
          <label className="manual-picker">
            <span>Manual</span>
            <select
              value={manual?.slug ?? ""}
              onChange={(e) => void openManual(e.target.value, null).catch(fail)}
            >
              {manuals.map((m) => (
                <option key={m.slug} value={m.slug}>
                  {m.title}
                </option>
              ))}
            </select>
          </label>
        )}

        {manual && (
          <nav className="pages" aria-label="Páginas do manual">
            <div className="pages-head">
              <span>Páginas</span>
              <button type="button" className="link-btn" onClick={() => void addPage(null)}>
                + Nova página
              </button>
            </div>
            {manual.pages.length === 0 ? (
              <p className="muted small">Nenhuma página ainda.</p>
            ) : (
              <PageTree
                pages={manual.pages}
                selectedId={page?.id ?? null}
                onSelect={(id) => void selectPage(id)}
                onAddChild={(id) => void addPage(id)}
                onRemove={(item) => void removePage(item)}
                onMove={(id, parentId, index) => void movePage(id, parentId, index)}
              />
            )}
          </nav>
        )}

        {/* A key troca quando surge o primeiro manual, para o formulário recolher sozinho. */}
        <NewManual key={manuals.length > 0 ? "compacto" : "aberto"} compact={manuals.length > 0} onCreate={createManual} />
      </aside>

      <main className="main">
        {error && (
          <div className="alert" role="alert">
            <span>{error}</span>
            <button type="button" className="link-btn" onClick={() => setError(null)}>
              Fechar
            </button>
          </div>
        )}

        {!manual ? (
          <Welcome />
        ) : !page ? (
          <div className="empty">
            <h1>{manual.title}</h1>
            <p>Este manual ainda não tem páginas.</p>
            <button type="button" className="primary" onClick={() => void addPage(null)}>
              Criar a primeira página
            </button>
          </div>
        ) : (
          <article className="page" key={page.id}>
            <header className="page-head">
              <span className="crumb">{manual.title}</span>
              <span className={`save save-${save}`} aria-live="polite">
                {save === "saving" ? "Salvando…" : save === "saved" ? "Salvo" : save === "error" ? "Erro ao salvar" : ""}
              </span>
            </header>
            <input
              className="page-title"
              aria-label="Título da página"
              defaultValue={page.title}
              placeholder="Título da página"
              onChange={(e) => {
                const title = e.target.value;
                if (!title.trim()) return;
                setManual((m) => (m ? { ...m, pages: renameInTree(m.pages, page.id, title) } : m));
                queue(manual.slug, page.id, { title });
              }}
            />
            <Editor
              slug={manual.slug}
              pageId={page.id}
              initialMarkdown={page.body}
              onChange={(body) => queue(manual.slug, page.id, { body })}
              onError={setError}
            />
          </article>
        )}
      </main>
    </div>
  );
}

function NewManual({ compact, onCreate }: { compact: boolean; onCreate: (title: string) => Promise<void> }) {
  const [open, setOpen] = useState(!compact);
  const [title, setTitle] = useState("");
  if (!open) {
    return (
      <button type="button" className="link-btn new-manual" onClick={() => setOpen(true)}>
        + Novo manual
      </button>
    );
  }
  return (
    <form
      className="new-manual-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (!title.trim()) return;
        void onCreate(title.trim()).then(() => {
          setTitle("");
          setOpen(!compact);
        });
      }}
    >
      <label htmlFor="new-manual-title">Novo manual</label>
      <input id="new-manual-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Manual do Financeiro" />
      <button type="submit" className="primary" disabled={!title.trim()}>
        Criar manual
      </button>
    </form>
  );
}

function Welcome() {
  return (
    <div className="empty">
      <h1>Bem-vindo ao Explicaí</h1>
      <p>Crie o primeiro manual na barra ao lado. Cada manual vira uma pasta com páginas em Markdown, pronta para o git.</p>
    </div>
  );
}
