/** Cliente da API do Studio. Único ponto do editor que conhece URLs do servidor. */

import type { Annotations } from "./annotations";

export interface ManualSummary {
  slug: string;
  title: string;
  language: string;
}

export interface TreeItem {
  id: string;
  title: string;
  file: string;
  /** O arquivo da página sumiu ou está com erro (mexido fora do Studio). */
  problem?: string;
  /** A página está fixada numa versão guardada para o manual final. */
  published?: string;
  children: TreeItem[];
}

export interface ManualDetail extends ManualSummary {
  pages: TreeItem[];
}

export interface Page {
  id: string;
  title: string;
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
}

async function call<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const data: unknown = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? `Erro ${res.status}`);
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

  getAnnotations: (slug: string, asset: string) =>
    call<Annotations>(`${manualUrl(slug)}/annotations?asset=${encodeURIComponent(asset)}`),
  saveAnnotations: (slug: string, asset: string, annotations: Annotations) =>
    call<Annotations>(`${manualUrl(slug)}/annotations?asset=${encodeURIComponent(asset)}`, send("PUT", annotations)),

  uploadAsset: (slug: string, file: File) =>
    call<{ path: string }>(`${manualUrl(slug)}/assets?name=${encodeURIComponent(file.name || "imagem.png")}`, {
      method: "POST",
      body: file,
    }),
};

export function errorMessage(err: unknown, fallback = "Algo deu errado."): string {
  return err instanceof Error ? err.message : fallback;
}
