/** Contas de cor do tema do manual: hexadecimal de 6 dígitos, contraste WCAG com branco e com outra cor. */

export const HEX = /^#[0-9a-f]{6}$/i;

type Rgb = [number, number, number];

const rgb = (hex: string): Rgb => [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16)) as Rgb;
const toHex = (c: Rgb) => `#${c.map((n) => Math.round(n).toString(16).padStart(2, "0")).join("")}`;

function luminance(c: Rgb): number {
  const [r, g, b] = c.map((n) => {
    const s = n / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  }) as Rgb;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const ratio = (a: Rgb, b: Rgb): number => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
};

const WHITE: Rgb = [255, 255, 255];

/** Contraste entre duas cores, de 1 a 21. */
export const contrast = (a: string, b: string): number => ratio(rgb(a), rgb(b));
export const contrastWithWhite = (hex: string): number => ratio(rgb(hex), WHITE);

/** `#rrggbb` com transparência, como `rgba()`. */
export const withAlpha = (hex: string, alpha: number): string => `rgba(${rgb(hex).join(",")},${alpha})`;

/** A cor sobre o papel branco, com a transparência dada: o que a pessoa vê de um marca-texto. */
export const overWhite = (hex: string, alpha: number): string => toHex(rgb(hex).map((n) => n * alpha + 255 * (1 - alpha)) as Rgb);

/** Versão mais clara da cor, para texto secundário: a mais clara que ainda passa de 4,5:1 com o branco. */
export function muted(hex: string, min = 4.5): string {
  for (const keep of [0.8, 0.85, 0.9, 0.95]) {
    const next = toHex(rgb(hex).map((n) => n * keep + 255 * (1 - keep)) as Rgb);
    if (contrastWithWhite(next) >= min) return next;
  }
  return hex;
}
