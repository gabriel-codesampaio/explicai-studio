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
  /** Perfis que veem a página; sem o campo, todos. */
  audience?: string[];
  children: TreeItem[];
}

export type HeadingSlot = "cover" | "page" | "h1" | "h2" | "h3";

export interface ManualTheme {
  accent?: string;
  text?: string;
  highlight?: string;
  headings?: Partial<Record<HeadingSlot, string>>;
  fonts?: { text?: string; headings?: string };
  /** Logo do cliente: `assets/<arquivo>`. */
  logo?: string;
  hideColophon?: true;
}

/** Só os campos enviados mudam; `null` volta o campo ao padrão. */
export type ThemePatch = Partial<Record<"accent" | "text" | "highlight", string | null>> & {
  headings?: Partial<Record<HeadingSlot, string | null>>;
  fonts?: Partial<Record<"text" | "headings", string | null>>;
  logo?: string | null;
  hideColophon?: true | null;
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
  /** Perfis conhecidos do manual (`admin`, `cliente`…). */
  audiences: string[];
  /** Formato do manual quando é mais novo que o do Studio: abre só para leitura. */
  newerFormat?: number;
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
  audience?: string[];
  /** Versão do arquivo no disco; volta no `If-Match` para o servidor detectar edição feita fora. */
  version?: string;
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
  /** Lista vazia tira a restrição: a página volta a valer para todos. */
  audience?: string[];
  /** "keep" grava o título sem renomear o arquivo; "sync" renomeia se o nome não combina com o título. */
  fileName?: "keep" | "sync";
}

/** Erro da API. `code` e `params` (quando o núcleo manda) deixam a interface traduzir a mensagem. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly code?: string,
    readonly params: Record<string, string | number> = {},
    /** Status HTTP; 0 quando o pedido nem chegou ao servidor. */
    readonly status = 0,
  ) {
    super(message);
  }
}

/** O Studio não respondeu: fetch falhou, ou o proxy do Vite devolveu 502/503/504 (servidor reiniciando). */
export const isOffline = (err: unknown): boolean => err instanceof ApiError && err.code === "offline";

const GATEWAY_DOWN = [502, 503, 504];

async function call<T>(url: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch {
    throw new ApiError("Servidor fora.", "offline");
  }
  const data: unknown = await res.json().catch(() => ({}));
  if (!res.ok) {
    const { error, code, params } = data as { error?: string; code?: string; params?: Record<string, string | number> };
    if (!code && GATEWAY_DOWN.includes(res.status)) throw new ApiError("Servidor fora.", "offline", {}, res.status);
    throw new ApiError(error ?? t("Erro {status}", { status: res.status }), code, params, res.status);
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
  renameManual: (slug: string, title: string) => call<{ slug: string; title: string }>(manualUrl(slug), send("PUT", { title })),
  getManual: (slug: string) => call<ManualDetail>(manualUrl(slug)),

  addPage: (slug: string, title: string, parentId: string | null) =>
    call<Page>(`${manualUrl(slug)}/pages`, send("POST", { title, parentId })),
  getPage: (slug: string, id: string) => call<Page>(pageUrl(slug, id)),
  updatePage: (slug: string, id: string, patch: PagePatch, version?: string) => {
    const init = send("PUT", patch);
    return call<Page>(pageUrl(slug, id), version ? { ...init, headers: { ...init.headers, "if-match": version } } : init);
  },
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
  /** Apaga a versão (não volta). A escolhida para o manual é recusada (409). */
  deleteVersion: (slug: string, id: string, versionId: string) =>
    call<{ ok: true }>(`${pageUrl(slug, id)}/versions/${encodeURIComponent(versionId)}`, { method: "DELETE" }),
  /** `null` volta a usar o texto atual no manual final. */
  publishVersion: (slug: string, id: string, versionId: string | null) =>
    call<{ ok: true }>(`${pageUrl(slug, id)}/published`, send("PUT", { versionId })),

  addAudience: (slug: string, name: string) => call<{ name: string }>(`${manualUrl(slug)}/audiences`, send("POST", { name })),
  renameAudience: (slug: string, from: string, name: string) =>
    call<{ name: string; pages: number }>(`${manualUrl(slug)}/audiences/${encodeURIComponent(from)}`, send("PATCH", { name })),
  removeAudience: (slug: string, name: string) =>
    call<{ freed: { id: string; title: string }[] }>(`${manualUrl(slug)}/audiences/${encodeURIComponent(name)}`, {
      method: "DELETE",
    }),

  listFonts: () => call<FontInfo[]>("/api/fonts"),
  exportManual: (slug: string, format: ExportFormat, onlyApproved: boolean, audience?: string) =>
    call<ExportResult>(`${manualUrl(slug)}/export`, send("POST", { format, onlyApproved, ...(audience ? { audience } : {}) })),
  setTheme: (slug: string, patch: ThemePatch) => call<{ ok: true }>(`${manualUrl(slug)}/theme`, send("PUT", patch)),

  /** Envia o logo (PNG, JPG ou SVG, até 1 MB); o servidor guarda em assets/ e põe no tema. */
  uploadLogo: (slug: string, file: File) =>
    call<{ path: string }>(`${manualUrl(slug)}/logo?name=${encodeURIComponent(file.name || "logo.png")}`, {
      method: "POST",
      body: file,
    }),

  getAnnotations: (slug: string, asset: string) =>
    call<Annotations>(`${manualUrl(slug)}/annotations?asset=${encodeURIComponent(asset)}`),
  saveAnnotations: (slug: string, asset: string, annotations: Annotations) =>
    call<Annotations>(`${manualUrl(slug)}/annotations?asset=${encodeURIComponent(asset)}`, send("PUT", annotations)),

  /** A pasta do manual está dentro de um repositório git? Aí o print original continua no histórico. */
  inGitRepo: (slug: string) => call<{ git: boolean }>(`${manualUrl(slug)}/git`),
  /** Troca o arquivo do print pela versão já tarjada (PNG, JPEG ou WebP do mesmo formato e tamanho) e apaga o original. */
  redactAsset: (slug: string, asset: string, image: Blob) =>
    call<{ path: string }>(`${manualUrl(slug)}/assets/redact?asset=${encodeURIComponent(asset)}`, {
      method: "POST",
      body: image,
    }),
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
const forbidden = () => t("O Studio só aceita pedidos deste computador. Abra-o por localhost ou 127.0.0.1.");

const CODED: Record<string, (p: Record<string, string | number>) => string> = {
  offline: () => t("Não foi possível falar com o Studio. Ele pode ter sido fechado ou estar reiniciando."),
  "forbidden-host": forbidden,
  "forbidden-origin": forbidden,
  "invalid-utf8": () => t("O Studio recebeu um texto que não está em UTF-8. Salve o conteúdo em UTF-8 e envie de novo."),
  "malformed-url": () => t("O endereço pedido tem um % malformado. Confira o endereço e tente de novo."),
  "annotations-invalid": (p) =>
    t("As marcações de {file} estão com erro de sintaxe. Corrija ou apague o arquivo.", { file: String(p.file) }),
  "format-newer": (p) =>
    t(
      "Este manual usa o formato {version}, mais novo que o deste Studio. Atualize o Studio (npx explicai@latest) para editar. Nada foi alterado.",
      {
        version: String(p.version),
      },
    ),
  "disk-conflict": () =>
    t("Esta página foi alterada fora do Studio depois que você a abriu. Recarregue do disco ou mantenha a sua versão."),
  "no-browser": () =>
    t(
      "Para gerar o PDF, o Explicaí usa o Chrome, o Edge ou o Chromium da sua máquina, e nenhum foi encontrado. Instale um deles ou informe o caminho na variável EXPLICAI_BROWSER.",
    ),
  "no-approved-pages": () => t("Nenhuma página está aprovada ou publicada. Aprove uma página ou exporte todas."),
  "audience-empty": () => t("Dê um nome ao público."),
  "audience-too-long": (p) => t("O nome do público tem no máximo {max} caracteres.", { max: String(p.max) }),
  "audience-duplicate": (p) => t("Já existe um público chamado {name}.", { name: String(p.name) }),
  "audience-not-found": (p) => t("O público {name} não existe mais. Feche e abra de novo.", { name: String(p.name) }),
  "logo-type": () => t("O logo precisa ser PNG, JPG ou SVG. Escolha outro arquivo."),
  "logo-path": () => t("O logo precisa estar na pasta assets/ do manual."),
  "logo-missing": (p) => t("O logo {logo} não está mais no manual. Envie o arquivo de novo.", { logo: String(p.logo) }),
  "logo-size": (p) => t("O logo passa de {max} MB. Reduza o arquivo e envie de novo.", { max: String(p.max) }),
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
