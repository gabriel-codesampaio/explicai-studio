// Copia as fontes de FONTS (e a licença de cada uma) do @fontsource para `fonts/`.
// Uso: npm run fonts:sync  (ou `npm run fonts:sync -- <pasta node_modules>`)
import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { FONTS, fontFiles, MONO } from "../src/core/export/fonts.js";

const modules = path.resolve(process.argv[2] ?? "node_modules");
const out = path.resolve("fonts");
await mkdir(out, { recursive: true });
for (const f of [...FONTS, MONO]) {
  const pkg = path.join(modules, f.variable ? "@fontsource-variable" : "@fontsource", f.id);
  for (const { file } of fontFiles(f)) await copyFile(path.join(pkg, "files", file), path.join(out, file));
  await copyFile(path.join(pkg, "LICENSE"), path.join(out, `OFL-${f.id}.txt`));
  console.log(`${f.id}: ok`);
}
