/** Cliente da API do Studio. Único ponto do editor que conhece URLs do servidor. */

export interface ManualSummary {
  slug: string;
  title: string;
  language: string;
}

export interface TreeItem {
  id: string;
  title: string;
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
  removePage: (slug: string, id: string) => call<{ ok: true }>(pageUrl(slug, id), { method: "DELETE" }),
  movePage: (slug: string, id: string, parentId: string | null, index: number) =>
    call<{ ok: true }>(`${pageUrl(slug, id)}/move`, send("POST", { parentId, index })),

  uploadAsset: (slug: string, file: File) =>
    call<{ path: string }>(`${manualUrl(slug)}/assets?name=${encodeURIComponent(file.name || "imagem.png")}`, {
      method: "POST",
      body: file,
    }),
};

export function errorMessage(err: unknown, fallback = "Algo deu errado."): string {
  return err instanceof Error ? err.message : fallback;
}
