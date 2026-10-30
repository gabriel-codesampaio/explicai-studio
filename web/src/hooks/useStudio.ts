import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  api,
  type ExportFormat,
  errorMessage,
  isOffline,
  type ManualDetail,
  type ManualSummary,
  type Page,
  type PagePatch,
  type PageStatus,
  type ThemePatch,
  type TreeItem,
} from "../lib/api";
import { readLocation, writeLocation } from "../lib/hashRoute";
import { locale, t, tn } from "../lib/i18n";
import { findItem, flattenItems, renameItem } from "../lib/tree";
import { useAutosave } from "./useAutosave";
import { useReconnect } from "./useReconnect";

/** Estado do Studio (manuais, manual aberto, página aberta) e as ações sobre ele. */
export function useStudio() {
  const [manuals, setManuals] = useState<ManualSummary[] | null>(null);
  const [manual, setManual] = useState<ManualDetail | null>(null);
  const [page, setPage] = useState<Page | null>(null);
  const [bootError, setBootError] = useState<unknown>(null);
  /** O servidor parou de responder com o Studio já aberto (ou durante a abertura). */
  const [serverDown, setServerDown] = useState(false);
  /** Link (hash) que não leva a lugar nenhum: manual ou página que não existe. */
  const [notFound, setNotFound] = useState<{ kind: "manual" | "page"; address: string } | null>(null);
  /** O manual existe na lista mas não abriu (pasta sumida, sem permissão). */
  const [openError, setOpenError] = useState<{ slug: string; error: unknown } | null>(null);
  /** true enquanto o formulário de novo manual está aberto na área principal. */
  const [creatingManual, setCreatingManual] = useState(false);
  /** Muda quando o texto da página aberta é trocado por fora do editor (restaurar versão), para recriar o editor. */
  const [revision, setRevision] = useState(0);

  const autosave = useAutosave(async (job) => {
    const saved = await api.updatePage(job.slug, job.id, job.patch).catch((err: unknown) => {
      if (isOffline(err)) setServerDown(true);
      throw err;
    });
    // O arquivo muda de nome com o título; a linha de status mostra o caminho atual.
    setPage((p) => (p && p.id === saved.id ? { ...p, file: saved.file } : p));
  });
  const { flush } = autosave;

  /** Roda a ação e mostra o erro num aviso, em vez de deixar a promessa sem tratamento. */
  const run = useCallback(async (action: () => Promise<void>) => {
    try {
      await action();
    } catch (err) {
      // Servidor fora não vira aviso solto: o banner (ou a tela de abertura) cuida, e a reconexão é automática.
      if (isOffline(err)) setServerDown(true);
      else toast.error(errorMessage(err));
    }
  }, []);

  const showPage = useCallback(async (slug: string, pageId: string | null) => {
    setPage(pageId ? await api.getPage(slug, pageId) : null);
    setNotFound(null);
    writeLocation({ slug, pageId });
  }, []);

  const refreshManual = useCallback(async (slug: string) => {
    const detail = await api.getManual(slug);
    setManual(detail);
    return detail;
  }, []);

  /** `pageId` que não está no manual abre a tela "não achamos esta página", em vez de cair em outra sem avisar. */
  const openManual = useCallback(
    async (slug: string, pageId: string | null = null) => {
      try {
        await flush();
        setCreatingManual(false);
        setOpenError(null);
        const detail = await refreshManual(slug);
        const found = pageId ? findItem(detail.pages, pageId)?.id : undefined;
        if (pageId && !found) {
          setPage(null);
          setNotFound({ kind: "page", address: `#/${slug}/${pageId}` });
          return;
        }
        await showPage(slug, found ?? detail.pages[0]?.id ?? null);
      } catch (err) {
        if (isOffline(err)) return setServerDown(true);
        setManual(null);
        setPage(null);
        setOpenError({ slug, error: err });
      }
    },
    [flush, refreshManual, showPage],
  );

  /** Abre o que o endereço (hash) pede. Manual que não existe vira a tela 404; sem endereço, o primeiro manual. */
  const openFromLocation = useCallback(
    async (list: ManualSummary[]) => {
      const { slug, pageId } = readLocation();
      const match = list.find((m) => m.slug === slug);
      if (slug && !match) {
        setManual(null);
        setPage(null);
        setNotFound({ kind: "manual", address: `#/${slug}${pageId ? `/${pageId}` : ""}` });
        return;
      }
      const start = match ?? list[0];
      if (start) await openManual(start.slug, match ? pageId : null);
    },
    [openManual],
  );

  const boot = useCallback(async () => {
    try {
      const list = await api.listManuals();
      setManuals(list);
      setBootError(null);
      await openFromLocation(list);
    } catch (err) {
      setBootError(err);
    }
  }, [openFromLocation]);

  useEffect(() => {
    void boot();
  }, [boot]);

  // Colar outro endereço na mesma aba só troca o hash: abre o que ele pede. (writeLocation usa replaceState, que não dispara isto.)
  const manualsRef = useRef(manuals);
  manualsRef.current = manuals;
  useEffect(() => {
    const onHash = () => manualsRef.current && void openFromLocation(manualsRef.current);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [openFromLocation]);

  // Servidor fora: confere com espera crescente; ao voltar, termina a abertura ou regrava o que ficou na fila.
  const down = serverDown || (manuals === null && isOffline(bootError));
  const reconnect = useReconnect(
    down,
    () => api.listManuals(),
    () => {
      setServerDown(false);
      if (manuals === null) return void boot();
      if (!manual) void openFromLocation(manuals);
      void flush();
      toast.success(t("A conexão com o Studio voltou."));
    },
  );

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
      setNotFound(null);
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
      const nome = item.title || t("Sem título");
      const message = sub
        ? tn(sub, '"{nome}" e {n} subpágina foram para a lixeira.', '"{nome}" e {n} subpáginas foram para a lixeira.', { nome })
        : t('"{nome}" foi para a lixeira.', { nome });
      toast(message, {
        duration: 10_000,
        action: { label: t("Desfazer"), onClick: () => void restorePage(slug, trashId, item.id) },
      });
    });

  /** Guarda o texto atual como versão. Antes, grava o que ainda está na fila do salvamento automático. */
  const saveVersion = (note: string) =>
    run(async () => {
      if (!manual || !page) return;
      await flush();
      await api.saveVersion(manual.slug, page.id, note);
      toast.success(t("Versão guardada."));
    });

  const restoreVersion = (versionId: string) =>
    run(async () => {
      if (!manual || !page) return;
      await flush();
      const restored = await api.restoreVersion(manual.slug, page.id, versionId);
      await refreshManual(manual.slug);
      setPage(restored);
      setRevision((r) => r + 1);
      toast(t('Versão restaurada. O texto que estava antes foi guardado como "Antes de restaurar".'));
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
    if (!manual) throw new Error(t("Abra um manual para exportar."));
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

  /** Cores do manual exportado. Lança se o core recusar a cor: quem chama mostra o motivo no campo. */
  const setManualTheme = async (patch: ThemePatch) => {
    if (!manual) return;
    await api.setTheme(manual.slug, patch);
    await refreshManual(manual.slug);
  };

  const movePage = (id: string, parentId: string | null, index: number) =>
    run(async () => {
      if (!manual) return;
      await api.movePage(manual.slug, id, parentId, index);
      await refreshManual(manual.slug);
    });

  const createManual = (title: string) =>
    run(async () => {
      const created = await api.createManual(title, locale);
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
    notFound,
    openError,
    serverDown: down,
    reconnect,
    reload: boot,
    openFromLocation,
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
    setManualTheme,
    setPageStatus,
    createManual,
    editPage,
    reportError: (message: string) => toast.error(message),
  };
}

export type Studio = ReturnType<typeof useStudio>;
