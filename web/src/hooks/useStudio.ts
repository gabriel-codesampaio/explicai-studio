import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  api,
  type ExportFormat,
  errorMessage,
  type ManualDetail,
  type ManualSummary,
  type Page,
  type PagePatch,
  type PageStatus,
  type TreeItem,
} from "../lib/api";
import { readLocation, writeLocation } from "../lib/hashRoute";
import { findItem, flattenItems, renameItem } from "../lib/tree";
import { useAutosave } from "./useAutosave";

/** Estado do Studio (manuais, manual aberto, página aberta) e as ações sobre ele. */
export function useStudio() {
  const [manuals, setManuals] = useState<ManualSummary[] | null>(null);
  const [manual, setManual] = useState<ManualDetail | null>(null);
  const [page, setPage] = useState<Page | null>(null);
  const [bootError, setBootError] = useState<string | null>(null);
  /** true enquanto o formulário de novo manual está aberto na área principal. */
  const [creatingManual, setCreatingManual] = useState(false);
  /** Muda quando o texto da página aberta é trocado por fora do editor (restaurar versão), para recriar o editor. */
  const [revision, setRevision] = useState(0);

  const autosave = useAutosave(async (job) => {
    const saved = await api.updatePage(job.slug, job.id, job.patch);
    // O arquivo muda de nome com o título; a linha de status mostra o caminho atual.
    setPage((p) => (p && p.id === saved.id ? { ...p, file: saved.file } : p));
  });
  const { flush } = autosave;

  /** Roda a ação e mostra o erro num aviso, em vez de deixar a promessa sem tratamento. */
  const run = useCallback(async (action: () => Promise<void>) => {
    try {
      await action();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }, []);

  const showPage = useCallback(async (slug: string, pageId: string | null) => {
    setPage(pageId ? await api.getPage(slug, pageId) : null);
    writeLocation({ slug, pageId });
  }, []);

  const refreshManual = useCallback(async (slug: string) => {
    const detail = await api.getManual(slug);
    setManual(detail);
    return detail;
  }, []);

  const openManual = useCallback(
    (slug: string, pageId: string | null = null) =>
      run(async () => {
        await flush();
        setCreatingManual(false);
        const detail = await refreshManual(slug);
        const target = (pageId && findItem(detail.pages, pageId)?.id) || detail.pages[0]?.id || null;
        await showPage(slug, target);
      }),
    [flush, run, refreshManual, showPage],
  );

  useEffect(() => {
    api
      .listManuals()
      .then(async (list) => {
        setManuals(list);
        const { slug, pageId } = readLocation();
        const start = list.find((m) => m.slug === slug) ?? list[0];
        if (start) await openManual(start.slug, start.slug === slug ? pageId : null);
      })
      .catch((err: unknown) => setBootError(errorMessage(err, "Não foi possível abrir o Studio.")));
  }, [openManual]);

  const selectPage = (id: string) =>
    run(async () => {
      if (!manual || id === page?.id) return;
      await flush();
      await showPage(manual.slug, id);
    });

  /** Página nova nasce sem título, com o cursor no campo de título (ver PageView). */
  const addPage = (parentId: string | null) =>
    run(async () => {
      if (!manual) return;
      await flush();
      const created = await api.addPage(manual.slug, "", parentId);
      await refreshManual(manual.slug);
      setPage(created);
      writeLocation({ slug: manual.slug, pageId: created.id });
    });

  /** Devolve uma exclusão da lixeira e abre a página restaurada. */
  const restorePage = (slug: string, trashId: string, pageId: string) =>
    run(async () => {
      await api.restorePage(slug, trashId);
      await refreshManual(slug);
      await showPage(slug, pageId);
    });

  /** Exclui na hora e oferece "Desfazer": a página fica na lixeira do manual. */
  const removePage = (item: TreeItem) =>
    run(async () => {
      if (!manual) return;
      const slug = manual.slug;
      autosave.discard(item.id);
      const { trashId } = await api.removePage(slug, item.id);
      const detail = await refreshManual(slug);
      if (page && !findItem(detail.pages, page.id)) await showPage(slug, detail.pages[0]?.id ?? null);

      const sub = flattenItems(item.children).length;
      const what = `"${item.title || "Sem título"}"${sub ? ` e ${sub} ${sub === 1 ? "subpágina" : "subpáginas"}` : ""}`;
      toast(`${what} ${sub ? "foram" : "foi"} para a lixeira.`, {
        duration: 10_000,
        action: { label: "Desfazer", onClick: () => void restorePage(slug, trashId, item.id) },
      });
    });

  /** Guarda o texto atual como versão. Antes, grava o que ainda está na fila do salvamento automático. */
  const saveVersion = (note: string) =>
    run(async () => {
      if (!manual || !page) return;
      await flush();
      await api.saveVersion(manual.slug, page.id, note);
      toast.success("Versão guardada.");
    });

  const restoreVersion = (versionId: string) =>
    run(async () => {
      if (!manual || !page) return;
      await flush();
      const restored = await api.restoreVersion(manual.slug, page.id, versionId);
      await refreshManual(manual.slug);
      setPage(restored);
      setRevision((r) => r + 1);
      toast('Versão restaurada. O texto que estava antes foi guardado como "Antes de restaurar".');
    });

  /** Escolhe a versão do manual final (`null` volta ao texto atual) e atualiza a árvore, que mostra a escolha. */
  const publishVersion = (versionId: string | null) =>
    run(async () => {
      if (!manual || !page) return;
      await api.publishVersion(manual.slug, page.id, versionId);
      await refreshManual(manual.slug);
    });

  /** Grava o que ainda está na fila e exporta. O diálogo mostra o resultado ou o erro. */
  const exportManual = async (format: ExportFormat, onlyApproved: boolean) => {
    if (!manual) throw new Error("Abra um manual para exportar.");
    await flush();
    return api.exportManual(manual.slug, format, onlyApproved);
  };

  /** Etapa da página aberta no fluxo de aprovação. Grava na hora e atualiza a etiqueta na árvore. */
  const setPageStatus = (status: PageStatus) =>
    run(async () => {
      if (!manual || !page) return;
      await flush();
      const saved = await api.updatePage(manual.slug, page.id, { status });
      setPage((p) => (p && p.id === saved.id ? { ...p, status: saved.status } : p));
      await refreshManual(manual.slug);
    });

  /** Cor do manual exportado (`null` = a da marca). */
  const setManualAccent = (accent: string | null) =>
    run(async () => {
      if (!manual) return;
      await api.setTheme(manual.slug, accent);
      await refreshManual(manual.slug);
    });

  const movePage = (id: string, parentId: string | null, index: number) =>
    run(async () => {
      if (!manual) return;
      await api.movePage(manual.slug, id, parentId, index);
      await refreshManual(manual.slug);
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
    bootError,
    creatingManual,
    setCreatingManual,
    revision,
    save: { state: autosave.state, savedAt: autosave.savedAt, retry: autosave.retry },
    openManual,
    selectPage,
    addPage,
    removePage,
    restorePage,
    movePage,
    saveVersion,
    restoreVersion,
    publishVersion,
    exportManual,
    setManualAccent,
    setPageStatus,
    createManual,
    editPage,
    reportError: (message: string) => toast.error(message),
  };
}

export type Studio = ReturnType<typeof useStudio>;
