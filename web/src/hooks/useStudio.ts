import { useCallback, useEffect, useState } from "react";
import { api, errorMessage, type ManualDetail, type ManualSummary, type Page, type PagePatch, type TreeItem } from "../lib/api";
import { readLocation, writeLocation } from "../lib/hashRoute";
import { findItem, renameItem } from "../lib/tree";
import { useAutosave } from "./useAutosave";

/** Estado do Studio (manuais, manual aberto, página aberta) e as ações sobre ele. */
export function useStudio() {
  const [manuals, setManuals] = useState<ManualSummary[] | null>(null);
  const [manual, setManual] = useState<ManualDetail | null>(null);
  const [page, setPage] = useState<Page | null>(null);
  const [error, setError] = useState<string | null>(null);

  const autosave = useAutosave((job) => api.updatePage(job.slug, job.id, job.patch), setError);
  const { flush } = autosave;

  /** Roda a ação e mostra o erro na faixa do topo, em vez de deixar a promessa sem tratamento. */
  const run = useCallback(async (action: () => Promise<void>) => {
    try {
      await action();
    } catch (err) {
      setError(errorMessage(err));
    }
  }, []);

  const showPage = useCallback(async (slug: string, pageId: string | null) => {
    setPage(pageId ? await api.getPage(slug, pageId) : null);
    writeLocation({ slug, pageId });
  }, []);

  const openManual = useCallback(
    (slug: string, pageId: string | null = null) =>
      run(async () => {
        await flush();
        const detail = await api.getManual(slug);
        setManual(detail);
        const target = (pageId && findItem(detail.pages, pageId)?.id) || detail.pages[0]?.id || null;
        await showPage(slug, target);
      }),
    [flush, run, showPage],
  );

  useEffect(() => {
    void run(async () => {
      const list = await api.listManuals();
      setManuals(list);
      const { slug, pageId } = readLocation();
      const start = list.find((m) => m.slug === slug) ?? list[0];
      if (start) await openManual(start.slug, start.slug === slug ? pageId : null);
    });
  }, [openManual, run]);

  const selectPage = (id: string) =>
    run(async () => {
      if (!manual || id === page?.id) return;
      await flush();
      await showPage(manual.slug, id);
    });

  const addPage = (parentId: string | null) =>
    run(async () => {
      if (!manual) return;
      await flush();
      const created = await api.addPage(manual.slug, "Nova página", parentId);
      setManual(await api.getManual(manual.slug));
      setPage(created);
      writeLocation({ slug: manual.slug, pageId: created.id });
    });

  const removePage = (item: TreeItem) =>
    run(async () => {
      if (!manual) return;
      autosave.discard(item.id);
      await api.removePage(manual.slug, item.id);
      const detail = await api.getManual(manual.slug);
      setManual(detail);
      if (page && !findItem(detail.pages, page.id)) await showPage(manual.slug, detail.pages[0]?.id ?? null);
    });

  const movePage = (id: string, parentId: string | null, index: number) =>
    run(async () => {
      if (!manual) return;
      await api.movePage(manual.slug, id, parentId, index);
      setManual(await api.getManual(manual.slug));
    });

  const createManual = (title: string) =>
    run(async () => {
      const created = await api.createManual(title, "pt-BR");
      setManuals(await api.listManuals());
      await openManual(created.slug);
    });

  /** Edição da página aberta: atualiza a árvore na hora (título) e agenda a gravação. */
  const editPage = (patch: PagePatch) => {
    if (!manual || !page) return;
    if (patch.title !== undefined) {
      const title = patch.title;
      setManual((m) => (m ? { ...m, pages: renameItem(m.pages, page.id, title) } : m));
    }
    autosave.queue(manual.slug, page.id, patch);
  };

  return {
    manuals,
    manual,
    page,
    error,
    saveState: autosave.state,
    setError,
    clearError: () => setError(null),
    openManual,
    selectPage,
    addPage,
    removePage,
    movePage,
    createManual,
    editPage,
  };
}

export type Studio = ReturnType<typeof useStudio>;
