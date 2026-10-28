/** Endereço digitado sem protocolo ganha https://. Âncoras (#secao), caminhos e mailto: ficam como estão. */
export function normalizeHref(raw: string): string {
  const href = raw.trim();
  if (!href || /^(https?:|mailto:|#|\/)/i.test(href)) return href;
  return `https://${href}`;
}
