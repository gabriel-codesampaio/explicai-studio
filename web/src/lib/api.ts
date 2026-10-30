/** Cliente da API do Studio. Único ponto do editor que conhece URLs do servidor. */

import type { Annotations } from "./annotations";
import { locale, t } from "./i18n";

export interface ManualSummary {
  slug: string;
  title: string;
  language: string;
}

export type PageStatus = "rascunho" | "revisao" | "aprovado" | "publicado";

export interface TreeItem {
  id: string;
  title: string;
  status: PageStatus;
  file: string;
  /** O arquivo da página sumiu ou está com erro (mexido fora do Studio). */
  problem?: string;
  /** A página tem uma Versão do manual: o manual final usa essa versão guardada. */
  published?: string;
  children: TreeItem[];
}

export type HeadingSlot = "cover" | "page" | "h1" | "h2" | "h3";

export interface ManualTheme {
  accent?: string;
  text?: string;
  highlight?: string;
  headings?: Partial<Record<HeadingSlot, string>>;
  fonts?: { text?: string; headings?: string };
}

/** Só os campos enviados mudam; `null` volta o campo ao padrão. */
export type ThemePatch = Partial<Record<"accent" | "text" | "highlight", string | null>> & {
  headings?: Partial<Record<HeadingSlot, string | null>>;
  fonts?: Partial<Record<"text" | "headings", string | null>>;
};

/** Fonte empacotada para o manual exportado. */
export interface FontInfo {
  id: string;
  family: string;
  kind: "sans" | "serif";
  /** Tem itálico: só essas servem para o texto. */
  italic: boolean;
  files: { file: string; weight: string; style: "normal" | "italic" }[];
}

export interface ManualDetail extends ManualSummary {
  /** Cores do manual exportado; campo ausente = a da marca. */
  theme: ManualTheme;
  pages: TreeItem[];
}

export type ExportFormat = "html" | "pdf" | "markdown";

export interface ExportResult {
  format: ExportFormat;
  /** Arquivo gerado, relativo à pasta do manual. */
  file: string;
  /** Endereço para abrir o arquivo no navegador. */
  url: string;
  pages: number;
  warnings: string[];
}

export interface Page {
  id: string;
  title: string;
  status: PageStatus;
  body: string;
  file: string;
}

export interface TrashItem {
  trashId: string;
  pageId: string;
  title: string;
  pages: number;
  deletedAt: string;
}

export interface VersionInfo {
  id: string;
  title: string;
  /** Nome dado ao guardar. Pode ser vazio. */
  note: string;
  savedAt: string;
  /** É a versão escolhida para o manual final. */
  published: boolean;
}

export interface Version extends VersionInfo {
  body: string;
}

export interface PagePatch {
  title?: string;
  body?: string;
  status?: PageStatus;
}

/** Erro da API. `code` e `params` (quando o núcleo manda) deixam a interface traduzir a mensagem. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly code?: string,
    readonly params: Record<string, string | number> = {},
  ) {
    super(message);
  }
}

async function call<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const data: unknown = await res.json().catch(() => ({}));
  if (!res.ok) {
    const { error, code, params } = data as { error?: string; code?: string; params?: Record<string, string | number> };
    throw new ApiError(error ?? t("Erro {status}", { status: res.status }), code, params);
  }
  return data as T;
}

const send = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});

const manualUrl = (slug: string) => `/api/manuals/${encodeURIComponent(slug)}`;
const pageUrl = (slug: string, id: string) => `${manualUrl(slug)}/pages/${encodeURIComponent(id)}`;

export const api = {
  listManuals: () => call<ManualSummary[]>("/api/manuals"),
  createManual: (title: string, language: string) => call<ManualSummary>("/api/manuals", send("POST", { title, language })),
  getManual: (slug: string) => call<ManualDetail>(manualUrl(slug)),

  addPage: (slug: string, title: string, parentId: string | null) =>
    call<Page>(`${manualUrl(slug)}/pages`, send("POST", { title, parentId })),
  getPage: (slug: string, id: string) => call<Page>(pageUrl(slug, id)),
  updatePage: (slug: string, id: string, patch: PagePatch) => call<Page>(pageUrl(slug, id), send("PUT", patch)),
  /** Move para a lixeira. O trashId desfaz a exclusão com `restorePage`. */
  removePage: (slug: string, id: string) => call<{ trashId: string }>(pageUrl(slug, id), { method: "DELETE" }),
  listTrash: (slug: string) => call<TrashItem[]>(`${manualUrl(slug)}/trash`),
  restorePage: (slug: string, trashId: string) =>
    call<{ ok: true }>(`${manualUrl(slug)}/trash/${encodeURIComponent(trashId)}/restore`, { method: "POST" }),
  movePage: (slug: string, id: string, parentId: string | null, index: number) =>
    call<{ ok: true }>(`${pageUrl(slug, id)}/move`, send("POST", { parentId, index })),

  listVersions: (slug: string, id: string) => call<VersionInfo[]>(`${pageUrl(slug, id)}/versions`),
  getVersion: (slug: string, id: string, versionId: string) =>
    call<Version>(`${pageUrl(slug, id)}/versions/${encodeURIComponent(versionId)}`),
  saveVersion: (slug: string, id: string, note: string) =>
    call<VersionInfo>(`${pageUrl(slug, id)}/versions`, send("POST", { note })),
  /** Troca o texto da página pelo da versão; o texto anterior vira a versão "Antes de restaurar". */
  restoreVersion: (slug: string, id: string, versionId: string) =>
    call<Page>(`${pageUrl(slug, id)}/versions/${encodeURIComponent(versionId)}/restore`, { method: "POST" }),
  /** `null` volta a usar o texto atual no manual final. */
  publishVersion: (slug: string, id: string, versionId: string | null) =>
    call<{ ok: true }>(`${pageUrl(slug, id)}/published`, send("PUT", { versionId })),

  listFonts: () => call<FontInfo[]>("/api/fonts"),
  exportManual: (slug: string, format: ExportFormat, onlyApproved: boolean) =>
    call<ExportResult>(`${manualUrl(slug)}/export`, send("POST", { format, onlyApproved })),
  setTheme: (slug: string, patch: ThemePatch) => call<{ ok: true }>(`${manualUrl(slug)}/theme`, send("PUT", patch)),

  getAnnotations: (slug: string, asset: string) =>
    call<Annotations>(`${manualUrl(slug)}/annotations?asset=${encodeURIComponent(asset)}`),
  saveAnnotations: (slug: string, asset: string, annotations: Annotations) =>
    call<Annotations>(`${manualUrl(slug)}/annotations?asset=${encodeURIComponent(asset)}`, send("PUT", annotations)),

  unusedAssets: (slug: string) => call<{ count: number }>(`${manualUrl(slug)}/assets/unused`),
  cleanUnusedAssets: (slug: string) =>
    call<{ moved: number; folder: string | null }>(`${manualUrl(slug)}/assets/clean`, { method: "POST" }),

  uploadAsset: (slug: string, file: File) =>
    call<{ path: string }>(`${manualUrl(slug)}/assets?name=${encodeURIComponent(file.name || "imagem.png")}`, {
      method: "POST",
      body: file,
    }),
};

const ratio = (n: unknown) => Number(n).toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** Erros do núcleo com código: o texto vem do i18n, no idioma da interface. Sem código conhecido, vale a mensagem do servidor. */
const CODED: Record<string, (p: Record<string, string | number>) => string> = {
  "no-approved-pages": () => t("Nenhuma página está aprovada ou publicada. Aprove uma página ou exporte todas."),
  "low-contrast": (p) =>
    t("A cor de {label} tem contraste {ratio}:1 com o branco; o mínimo é {min}:1. Escolha uma cor mais escura.", {
      label: t(String(p.label)),
      ratio: ratio(p.ratio),
      min: ratio(p.min),
    }),
  "low-contrast-highlight": (p) =>
    t("O texto sobre o realce tem contraste {ratio}:1; o mínimo é {min}:1. Escolha um realce mais claro.", {
      ratio: ratio(p.ratio),
      min: ratio(p.min),
    }),
};

export function errorMessage(err: unknown, fallback = t("Algo deu errado.")): string {
  if (err instanceof ApiError && err.code) return CODED[err.code]?.(err.params) ?? err.message;
  return err instanceof Error ? err.message : fallback;
}
