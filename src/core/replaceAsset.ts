import { randomUUID } from "node:crypto";
import { copyFile, mkdir, readdir, readFile, rename, rm, rmdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { assetFile } from "./assets.js";
import { ExplicaiError } from "./errors.js";
import { imageSize } from "./export/imageSize.js";
import { exists, relativePosix, resolveInside, resolveInsideReal } from "./fs.js";
import { ASSETS_DIR, readManual } from "./manuals.js";

const TRASH_PREFIX = "imagens-";
const sameKind = (a: string, b: string) => {
  const norm = (f: string) => path.extname(f).toLowerCase().replace(".jpeg", ".jpg");
  return norm(a) === norm(b);
};

/**
 * Grava `data` no lugar da imagem (mesmo caminho, então Markdown e `.json` seguem valendo) e guarda a antiga em
 * `.lixeira/imagens-<data>/assets/`. Exige o mesmo formato (extensão) e que a imagem abra. Devolve a pasta da lixeira.
 */
export async function replaceAsset(
  dir: string,
  assetPath: string,
  fileName: string,
  data: Uint8Array,
): Promise<{ folder: string }> {
  await readManual(dir);
  const target = assetFile(dir, assetPath);
  if (!(await exists(target)))
    throw new ExplicaiError("replace-missing", `A imagem ${assetPath} não existe.`, { asset: assetPath });
  await resolveInsideReal(dir, assetPath);
  if (!sameKind(fileName, target)) {
    throw new ExplicaiError("replace-type", `A imagem nova precisa ter o mesmo formato da atual (${path.extname(target)}).`, {
      ext: path.extname(target),
    });
  }
  return swap(dir, target, data);
}

/** Desfaz a troca: o arquivo da lixeira volta ao lugar e o que estava lá vai para a lixeira, sem perder nada. */
export async function restoreReplacedAsset(dir: string, assetPath: string, folder: string): Promise<{ folder: string }> {
  await readManual(dir);
  const target = assetFile(dir, assetPath);
  await resolveInsideReal(dir, assetPath);
  const trash = resolveInside(dir, folder);
  const copy = path.join(trash, ASSETS_DIR, path.basename(target));
  const parent = path.dirname(trash);
  if (parent !== path.join(path.resolve(dir), ".lixeira") || !path.basename(trash).startsWith(TRASH_PREFIX)) {
    throw new ExplicaiError("replace-folder", "Pasta da lixeira de imagens inválida.");
  }
  if (!(await exists(copy)))
    throw new ExplicaiError("replace-missing", `A imagem ${assetPath} não está mais na lixeira.`, { asset: assetPath });
  const result = await swap(dir, target, await readFile(copy));
  await rm(copy);
  // A pasta pode guardar outras imagens (limpeza de sem uso): só some se ficou vazia.
  await rmdir(path.dirname(copy))
    .then(() => rmdir(trash))
    .catch(() => {});
  return result;
}

async function swap(dir: string, target: string, data: Uint8Array): Promise<{ folder: string }> {
  const tmp = `${target}.${randomUUID()}.tmp`;
  const folder = path.join(".lixeira", `${TRASH_PREFIX}${new Date().toISOString().replace(/[:.]/g, "-")}`);
  const kept = path.join(dir, folder, ASSETS_DIR, path.basename(target));
  try {
    await writeFile(tmp, data);
    if (!(await imageSize(tmp)))
      throw new ExplicaiError("replace-invalid", "A imagem nova não pôde ser lida. Escolha outro arquivo.");
    await mkdir(path.dirname(kept), { recursive: true });
    await copyFile(target, kept);
    await rename(tmp, target);
  } catch (err) {
    await rm(path.join(dir, folder), { recursive: true, force: true });
    throw err;
  } finally {
    await rm(tmp, { force: true });
  }
  return { folder: relativePosix(dir, path.join(dir, folder)) };
}
