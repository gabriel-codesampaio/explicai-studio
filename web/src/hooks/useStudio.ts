import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ApiError,
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

/** Tempo sem gravar o título até o arquivo da página mudar de nome. */
const RENAME_IDLE_MS = 5000;

const isConflict = (err: unknown) => err instanceof ApiError && err.code === "disk-conflict";

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

  /** Versão no disco da página que o Studio leu ou gravou por último (vai no If-Match). */
  const versions = useRef(new Map<string, string>());
  const remember = useCallback((p: Page) => {
    if (p.version) versions.current.set(p.id, p.version);
  }, []);
  /** Página cujo arquivo mudou no disco: nada é gravado nela até a pessoa escolher. */
  const conflict = useRef<{ slug: string; id: string } | null>(null);

  /** Página com conflito à espera da escolha: a faixa (DiskConflictBanner) só aparece nela. */
  const [conflictId, setConflictId] = useState<string | null>(null);
  /** Escolha da pessoa na faixa; a implementação fica abaixo, onde as ações de página já existem. */
  const resolveRef = useRef<(choice: "reload" | "keep") => void>(() => {});
  /** Faixa fixa até a pessoa escolher: nada é gravado nesta página enquanto isso. */
  const showConflict = useCallback((slug: string, id: string) => {
    conflict.current = { slug, id };
    setConflictId(id);
  }, []);

  /** Títulos já gravados cujo arquivo ainda tem o nome antigo: renomeia ao sair da página ou 5 s depois. */
  const renameDue = useRef(new Map<string, { slug: string; title: string }>());
  const renameTimer = useRef<number | undefined>(undefined);
  /** Grava a fila do autosave; preenchido abaixo (o autosave usa settleRenames, então vem depois). */
  const flushQueue = useRef<() => Promise<boolean>>(async () => true);
  const settleRenames = useCallback(async () => {
    window.clearTimeout(renameTimer.current);
    // Espera o autosave em voo: o sync lê a versão só depois dele (senão leva a antiga e dá 409 falso).
    if (!(await flushQueue.current())) return;
    for (const [id, { slug, title }] of [...renameDue.current]) {
      renameDue.current.delete(id);
      try {
        const saved = await api.updatePage(slug, id, { title, fileName: "sync" }, versions.current.get(id));
        remember(saved);
        setPage((p) => (p && p.id === saved.id ? { ...p, file: saved.file } : p));
      } catch (err) {
        renameDue.current.set(id, { slug, title }); // tenta de novo no próximo flush
        if (isOffline(err)) setServerDown(true);
        else if (isConflict(err)) showConflict(slug, id);
      }
    }
  }, [remember, showConflict]);

  const autosave = useAutosave(async (job) => {
    // Título em digitação fica no mesmo arquivo; o arquivo muda de nome em settleRenames.
    const patch = job.patch.title === undefined ? job.patch : { ...job.patch, fileName: "keep" as const };
    if (conflict.current?.id === job.id) {
      showConflict(job.slug, job.id);
      throw new ApiError("disk-conflict", "disk-conflict", {}, 409);
    }
    const saved = await api.updatePage(job.slug, job.id, patch, versions.current.get(job.id)).catch((err: unknown) => {
      if (isOffline(err)) setServerDown(true);
      else if (isConflict(err)) showConflict(job.slug, job.id);
      throw err;
    });
    remember(saved);
    if (patch.fileName) {
      renameDue.current.set(job.id, { slug: job.slug, title: saved.title });
      window.clearTimeout(renameTimer.current);
      renameTimer.current = window.setTimeout(() => void settleRenames(), RENAME_IDLE_MS);
    }
    // A linha de status mostra o caminho atual do arquivo.
    setPage((p) => (p && p.id === saved.id ? { ...p, file: saved.file } : p));
  });
  const autosaveFlush = autosave.flush;
  flushQueue.current = autosaveFlush;
  /** Grava a fila e, se tudo foi gravado, renomeia os arquivos cujo título mudou. */
  const flush = useCallback(async () => {
    const ok = await autosaveFlush();
    if (ok) await settleRenames();
    return ok;
  }, [autosaveFlush, settleRenames]);

  /** Roda a ação e mostra o erro num aviso, em vez de deixar a promessa sem tratamento. */
  const run = useCallback(async (action: () => Promise<void>) => {
    try {
      await action();
    } catch (err) {
      // Servidor fora não vira aviso solto: o banner (ou a tela de abertura) cuida, e a reconexão é automática.
      if (isOffline(err)) setServerDown(true);
      else if (!isConflict(err)) toast.error(errorMessage(err)); // conflito: a faixa já explica
    }
  }, []);

  /** Número da última abertura de página: resposta de uma abertura antiga não pode sobrescrever a atual. */
  const openSeq = useRef(0);

  const showPage = useCallback(
    async (slug: string, pageId: string | null) => {
      const seq = ++openSeq.current;
      const next = pageId ? await api.getPage(slug, pageId) : null;
      if (seq !== openSeq.current) return;
      if (next) remember(next);
      setPage(next);
      setNotFound(null);
      writeLocation({ slug, pageId });
    },
    [remember],
  );

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
      remember(created);
      openSeq.current++;
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
      renameDue.current.delete(item.id);
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
      remember(restored);
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
  const exportManual = async (format: ExportFormat, onlyApproved: boolean, audience?: string) => {
    if (!manual) throw new Error(t("Abra um manual para exportar."));
    await flush();
    return api.exportManual(manual.slug, format, onlyApproved, audience);
  };

  /** Perfis da página aberta. Lista vazia = todos. Grava na hora e atualiza a árvore e a lista de perfis do manual. */
  const audienceQueue = useRef<Promise<void>>(Promise.resolve());
  const setPageAudience = (audience: string[]) => {
    // Em fila: duas trocas seguidas gravam na ordem em que foram feitas, e a última vence (T-135).
    const next = audienceQueue.current.then(() => saveAudience(audience));
    audienceQueue.current = next;
    return next;
  };
  const saveAudience = (audience: string[]) =>
    run(async () => {
      if (!manual || !page) return;
      await flush();
      let saved: Page;
      try {
        saved = await api.updatePage(manual.slug, page.id, { audience }, versions.current.get(page.id));
      } catch (err) {
        if (isConflict(err)) autosave.queue(manual.slug, page.id, { audience });
        throw err;
      }
      remember(saved);
      setPage((p) => {
        if (!p || p.id !== saved.id) return p;
        const { audience: _old, ...rest } = p;
        return saved.audience ? { ...rest, audience: saved.audience } : rest;
      });
      await refreshManual(manual.slug);
    });

  /**
   * Cria, renomeia ou remove um público do manual. Erros sobem para o diálogo mostrar junto ao campo.
   * Renomear e remover mexem no arquivo das páginas: grava a fila antes (o editor não regrava o nome antigo) e relê a página aberta.
   */
  const changeAudiences = async (call: (slug: string) => Promise<unknown>, touchesPages: boolean) => {
    if (!manual) return;
    if (touchesPages) {
      await audienceQueue.current.catch(() => {});
      await flush();
    }
    await call(manual.slug);
    await refreshManual(manual.slug);
    if (touchesPages && page) await showPage(manual.slug, page.id);
  };
  const audiences = {
    add: (name: string) => changeAudiences((slug) => api.addAudience(slug, name), false),
    rename: (from: string, name: string) => changeAudiences((slug) => api.renameAudience(slug, from, name), true),
    remove: (name: string) => changeAudiences((slug) => api.removeAudience(slug, name), true),
  };

  /** Etapa da página aberta no fluxo de aprovação. Grava na hora e atualiza a etiqueta na árvore. */
  const setPageStatus = (status: PageStatus) =>
    run(async () => {
      if (!manual || !page) return;
      await flush();
      let saved: Page;
      try {
        saved = await api.updatePage(manual.slug, page.id, { status }, versions.current.get(page.id));
      } catch (err) {
        // A etapa fica na fila: "Manter a minha versão" grava, "Recarregar do disco" descarta.
        if (isConflict(err)) autosave.queue(manual.slug, page.id, { status });
        throw err;
      }
      remember(saved);
      setPage((p) => (p && p.id === saved.id ? { ...p, status: saved.status } : p));
      await refreshManual(manual.slug);
    });

  /** Cores do manual exportado. Lança se o core recusar a cor: quem chama mostra o motivo no campo. */
  const setManualTheme = async (patch: ThemePatch) => {
    if (!manual) return;
    await api.setTheme(manual.slug, patch);
    await refreshManual(manual.slug);
  };

  /** Envia o logo do manual exportado. Lança com o motivo se o core recusar o arquivo. */
  const uploadManualLogo = async (file: File) => {
    if (!manual) return;
    await api.uploadLogo(manual.slug, file);
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

  /** Muda só o título. Sem `run`: o erro volta ao diálogo, que o mostra ao lado do campo. */
  const renameManual = async (title: string) => {
    if (!manual) return;
    await api.renameManual(manual.slug, title);
    setManuals(await api.listManuals());
    await refreshManual(manual.slug);
  };

  resolveRef.current = (choice) =>
    run(async () => {
      const c = conflict.current;
      if (!c) return;
      if (choice === "reload") {
        // Só descarta o rascunho depois que a página do disco chegou: se a leitura falhar, nada se perde e a faixa continua.
        await refreshManual(c.slug);
        await showPage(c.slug, c.id);
        autosave.discard(c.id);
        renameDue.current.delete(c.id);
        conflict.current = null;
        setConflictId(null);
        setRevision((r) => r + 1);
        return;
      }
      remember(await api.getPage(c.slug, c.id)); // a versão que está no disco agora vira a base da regravação
      conflict.current = null;
      setConflictId(null);
      await flush();
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
    diskConflict: page !== null && conflictId === page.id,
    resolveConflict: (choice: "reload" | "keep") => resolveRef.current(choice),
    flush,
    save: {
      state: conflictId !== null && autosave.state === "error" ? ("conflict" as const) : autosave.state,
      savedAt: autosave.savedAt,
      retry: autosave.retry,
    },
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
    uploadManualLogo,
    setPageStatus,
    setPageAudience,
    audiences,
    createManual,
    renameManual,
    editPage,
    reportError: (message: string) => toast.error(message),
  };
}

export type Studio = ReturnType<typeof useStudio>;
