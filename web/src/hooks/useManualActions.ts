import type { Dispatch, SetStateAction } from "react";
import { toast } from "sonner";
import {
  api,
  type CoverPatch,
  type ExportFormat,
  type FooterPatch,
  type ManualDetail,
  type Page,
  type ThemePatch,
} from "../lib/api";
import { t } from "../lib/i18n";

/** O que as ações precisam do Studio: estado lido e funções que ele já tem. */
export type ManualActionsDeps = {
  manual: ManualDetail | null;
  page: Page | null;
  run: (action: () => Promise<void>) => Promise<void>;
  flush: () => Promise<boolean>;
  refreshManual: (slug: string) => Promise<ManualDetail>;
  remember: (p: Page) => void;
  setPage: Dispatch<SetStateAction<Page | null>>;
  setRevision: Dispatch<SetStateAction<number>>;
};

/** Ações de versão, exportação, tema, capa, rodapé e logo: chamam a `api` e atualizam o manual. */
export function useManualActions({ manual, page, run, flush, refreshManual, remember, setPage, setRevision }: ManualActionsDeps) {
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

  /** Cores do manual exportado. Lança se o core recusar a cor: quem chama mostra o motivo no campo. */
  const setManualTheme = async (patch: ThemePatch) => {
    if (!manual) return;
    await api.setTheme(manual.slug, patch);
    await refreshManual(manual.slug);
  };

  /** Capa e rodapé do manual exportado. Lançam com o motivo se o core recusar o texto. */
  const setManualCover = async (patch: CoverPatch) => {
    if (!manual) return;
    await api.setCover(manual.slug, patch);
    await refreshManual(manual.slug);
  };
  const setManualFooter = async (patch: FooterPatch) => {
    if (!manual) return;
    await api.setFooter(manual.slug, patch);
    await refreshManual(manual.slug);
  };

  /** Envia o logo do manual exportado. Lança com o motivo se o core recusar o arquivo. */
  const uploadManualLogo = async (file: File) => {
    if (!manual) return;
    await api.uploadLogo(manual.slug, file);
    await refreshManual(manual.slug);
  };

  return {
    saveVersion,
    restoreVersion,
    publishVersion,
    exportManual,
    setManualTheme,
    setManualCover,
    setManualFooter,
    uploadManualLogo,
  };
}
