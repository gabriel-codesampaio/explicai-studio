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

const m = (slug: string) => `/api/manuals/${encodeURIComponent(slug)}`;

export const api = {
  listManuals: () => call<ManualSummary[]>("/api/manuals"),
  createManual: (title: string, language: string) => call<ManualSummary>("/api/manuals", send("POST", { title, language })),
  getManual: (slug: string) => call<ManualDetail>(m(slug)),
  addPage: (slug: string, title: string, parentId: string | null) => call<Page>(`${m(slug)}/pages`, send("POST", { title, parentId })),
  getPage: (slug: string, id: string) => call<Page>(`${m(slug)}/pages/${id}`),
  updatePage: (slug: string, id: string, patch: { title?: string; body?: string }) =>
    call<Page>(`${m(slug)}/pages/${id}`, send("PUT", patch)),
  removePage: (slug: string, id: string) => call<{ ok: true }>(`${m(slug)}/pages/${id}`, { method: "DELETE" }),
  movePage: (slug: string, id: string, parentId: string | null, index: number) =>
    call<{ ok: true }>(`${m(slug)}/pages/${id}/move`, send("POST", { parentId, index })),
  uploadAsset: (slug: string, file: File) =>
    call<{ path: string }>(`${m(slug)}/assets?name=${encodeURIComponent(file.name || "imagem.png")}`, {
      method: "POST",
      body: file,
    }),
};

/** No disco a imagem é `../assets/x.png` (relativa à página). No editor, a URL servida pelo Studio. */
export function toEditorMarkdown(slug: string, md: string): string {
  return md.replace(/(!\[[^\]]*\]\()\.\.\/assets\//g, `$1/files/${encodeURIComponent(slug)}/assets/`);
}

export function toDiskMarkdown(md: string): string {
  return md.replace(/(!\[[^\]]*\]\()\/files\/[^/)]+\/assets\//g, "$1../assets/");
}
