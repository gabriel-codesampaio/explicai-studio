/** Rota no hash: `#/<manual>/<página>`. Assim, recarregar a aba volta para o mesmo lugar. */

export interface Location {
  slug: string | null;
  pageId: string | null;
}

export function readLocation(): Location {
  const [slug, pageId] = window.location.hash.replace(/^#\/?/, "").split("/").map(decodeURIComponent);
  return { slug: slug || null, pageId: pageId || null };
}

export function writeLocation({ slug, pageId }: Location): void {
  const next = slug ? `#/${encodeURIComponent(slug)}${pageId ? `/${encodeURIComponent(pageId)}` : ""}` : "#/";
  if (window.location.hash !== next) window.history.replaceState(null, "", next);
}
