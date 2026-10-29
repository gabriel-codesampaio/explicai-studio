/**
 * No disco a imagem é `../assets/x.png` (relativa à página). No editor, é a URL servida pelo Studio.
 * Converter na entrada e na saída mantém o Markdown do disco portátil.
 */

export function assetUrl(slug: string, assetPath: string): string {
  return `/files/${encodeURIComponent(slug)}/${assetPath}`;
}

export function toEditorMarkdown(slug: string, md: string): string {
  return md.replace(/(!\[[^\]]*\]\()\.\.\/assets\//g, `$1/files/${encodeURIComponent(slug)}/assets/`);
}

export function toDiskMarkdown(md: string): string {
  return md.replace(/(!\[[^\]]*\]\()\/files\/[^/)]+\/assets\//g, "$1../assets/");
}
