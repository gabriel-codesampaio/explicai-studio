import { randomUUID } from "node:crypto";
import { readFile, rename, stat, writeFile } from "node:fs/promises";
import path from "node:path";

/** Grava num arquivo temporário e renomeia, para um travamento no meio não deixar o arquivo pela metade. */
export async function atomicWrite(file: string, content: string): Promise<void> {
  const tmp = `${file}.${randomUUID()}.tmp`;
  await writeFile(tmp, content, "utf8");
  await rename(tmp, file);
}

/** Lê UTF-8 sem o BOM que o Bloco de Notas e alguns editores do Windows põem no começo: ele quebraria o JSON e o frontmatter. */
export async function readText(file: string): Promise<string> {
  return (await readFile(file, "utf8")).replace(/^﻿/, "");
}

/** Barreira de confiança: caminhos vêm do Agent e do navegador, então nada pode sair da pasta base. */
export function resolveInside(dir: string, relative: string): string {
  const root = path.resolve(dir);
  const abs = path.resolve(root, relative);
  if (abs !== root && !abs.startsWith(root + path.sep)) throw new Error(`Caminho fora do manual: ${relative}`);
  return abs;
}

/** `base.ext`, ou `base-2.ext`, `base-3.ext`… se já existir. */
export async function uniquePath(parent: string, base: string, ext: string): Promise<string> {
  for (let i = 1; ; i++) {
    const candidate = path.join(parent, `${i === 1 ? base : `${base}-${i}`}${ext}`);
    if (!(await exists(candidate))) return candidate;
  }
}

export async function exists(p: string): Promise<boolean> {
  return stat(p).then(
    () => true,
    () => false,
  );
}

/** Caminho relativo com `/`, igual em qualquer sistema, para gravar em manual.json e no Markdown. */
export function relativePosix(from: string, to: string): string {
  return path.relative(from, to).split(path.sep).join("/");
}
