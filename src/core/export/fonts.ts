/**
 * Fontes que o manual exportado pode usar. Todas OFL, empacotadas na pasta `fonts/` da raiz do pacote
 * (copiadas do @fontsource por `npm run fonts:sync`). O export copia só as escolhidas, então o HTML abre offline.
 */
export interface FontSpec {
  /** Nome do pacote do @fontsource, sem escopo: `inter`. É o valor gravado em `theme.fonts`. */
  id: string;
  family: string;
  kind: "sans" | "serif";
  /** Uma fonte variável (um arquivo para todos os pesos); senão, os arquivos de peso 400 e 700. */
  variable: boolean;
  /** Tem itálico empacotado: só essas servem para o texto do manual. */
  italic: boolean;
}

/** Pasta das fontes (OFL), na raiz do pacote: o mesmo caminho vale de `src/` e de `dist/`. */
export const FONTS_DIR = new URL("../../../fonts/", import.meta.url);

/** Atkinson (texto) e Archivo (títulos) são as da marca, usadas quando o manual não escolhe outra. */
export const DEFAULT_TEXT_FONT = "atkinson-hyperlegible-next";
export const DEFAULT_HEADINGS_FONT = "archivo";

export const FONTS: FontSpec[] = [
  { id: "atkinson-hyperlegible-next", family: "Atkinson Hyperlegible Next", kind: "sans", variable: false, italic: true },
  { id: "inter", family: "Inter", kind: "sans", variable: true, italic: true },
  { id: "source-sans-3", family: "Source Sans 3", kind: "sans", variable: true, italic: true },
  { id: "source-serif-4", family: "Source Serif 4", kind: "serif", variable: true, italic: true },
  { id: "lora", family: "Lora", kind: "serif", variable: true, italic: true },
  { id: "archivo", family: "Archivo", kind: "sans", variable: true, italic: false },
  { id: "montserrat", family: "Montserrat", kind: "sans", variable: true, italic: false },
  { id: "playfair-display", family: "Playfair Display", kind: "serif", variable: true, italic: false },
];

/** Código do manual: sempre sai com ela, não é escolha. */
export const MONO: FontSpec = { id: "jetbrains-mono", family: "JetBrains Mono", kind: "sans", variable: true, italic: false };

export const fontById = (id: string): FontSpec | undefined => FONTS.find((f) => f.id === id);

interface FontFile {
  file: string;
  weight: string;
  style: "normal" | "italic";
}

/** Os arquivos woff2 (latin) da fonte, com o nome que o @fontsource dá. */
export function fontFiles(f: FontSpec): FontFile[] {
  const name = (axis: string, style: string) => `${f.id}-latin-${axis}-${style}.woff2`;
  if (f.variable) {
    const files: FontFile[] = [{ file: name("wght", "normal"), weight: "100 900", style: "normal" }];
    if (f.italic) files.push({ file: name("wght", "italic"), weight: "100 900", style: "italic" });
    return files;
  }
  const files: FontFile[] = [{ file: name("400", "normal"), weight: "400", style: "normal" }];
  if (f.italic) files.push({ file: name("400", "italic"), weight: "400", style: "italic" });
  files.push({ file: name("700", "normal"), weight: "700", style: "normal" });
  return files;
}

/** O `@font-face` de cada arquivo da fonte, apontando para `fonts/`. */
export const fontFaceCss = (f: FontSpec): string =>
  fontFiles(f)
    .map(
      (x) =>
        `@font-face{font-family:"${f.family}";src:url(fonts/${x.file}) format("woff2");font-weight:${x.weight};font-style:${x.style};font-display:block}`,
    )
    .join("\n");

/** Valor de `font-family`: a fonte e, se não carregar, uma parecida do sistema. */
export const fontStack = (f: FontSpec): string =>
  `"${f.family}",${f.kind === "serif" ? 'Georgia,"Times New Roman",serif' : '"Segoe UI",system-ui,sans-serif'}`;
