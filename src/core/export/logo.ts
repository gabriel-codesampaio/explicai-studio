import { stat } from "node:fs/promises";
import path from "node:path";
import { ExplicaiError } from "../errors.js";
import { exists, resolveInside } from "../fs.js";

/** Tamanho máximo do logo: um logo é pequeno, e arquivo grande pesa em todo HTML exportado. */
export const LOGO_MAX_BYTES = 1024 * 1024;
export const LOGO_EXT = /^\.(png|jpe?g|svg)$/i;
const LOGO_TYPE_MSG = "O logo precisa ser PNG, JPG ou SVG.";
const LOGO_SIZE_MSG = "O logo passa de 1 MB. Reduza o arquivo e envie de novo.";

export const logoTypeError = () => new ExplicaiError("logo-type", LOGO_TYPE_MSG);
export const logoSizeError = () => new ExplicaiError("logo-size", LOGO_SIZE_MSG, { max: 1 });

/** O caminho vira `assets/<arquivo>`: sem pasta, sem `..`, sem barra invertida, só PNG, JPG ou SVG. */
export function checkLogoPath(value: unknown): string {
  if (typeof value !== "string" || !/^assets\/[^/\\]+$/.test(value) || value.includes("..")) {
    throw new ExplicaiError("logo-path", "O logo precisa estar em assets/ (assets/logo.png).");
  }
  if (!LOGO_EXT.test(path.posix.extname(value))) throw logoTypeError();
  return value;
}

/** Confere o arquivo no disco: existe e cabe em 1 MB. */
export async function checkLogoFile(dir: string, logo: string): Promise<void> {
  const abs = resolveInside(dir, logo);
  if (!(await exists(abs))) throw new ExplicaiError("logo-missing", `O logo ${logo} não existe no manual.`, { logo });
  if ((await stat(abs)).size > LOGO_MAX_BYTES) throw logoSizeError();
}
