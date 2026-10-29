import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { expect, it } from "vitest";
import { EN } from "../src/lib/i18n.en";

const SRC = path.join(import.meta.dirname, "..", "src");
// t("texto"), t('texto', ...) e as duas formas de tn(n, "um", "vários").
const T_CALL = /\bt\(\s*(["'])((?:\\.|(?!\1).)*)\1/g;
const TN_CALL = /\btn\(\s*[^,]+,\s*(["'])((?:\\.|(?!\1).)*)\1,\s*(["'])((?:\\.|(?!\3).)*)\3/g;

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? sourceFiles(path.join(dir, e.name)) : /\.tsx?$/.test(e.name) ? [path.join(dir, e.name)] : [],
  );
}

const unquote = (s: string) => s.replace(/\\(.)/g, "$1");

it("todo texto passado para t() e tn() tem tradução em inglês", () => {
  const missing: string[] = [];
  // Os arquivos de i18n citam t("...") nos comentários, como exemplo.
  for (const file of sourceFiles(SRC).filter((f) => !/i18n(\.en)?\.ts$/.test(f))) {
    const code = readFileSync(file, "utf8");
    const texts = [...code.matchAll(T_CALL)].map((m) => m[2] ?? "");
    for (const m of code.matchAll(TN_CALL)) texts.push(m[2] ?? "", m[4] ?? "");
    for (const text of texts.map(unquote)) {
      if (!(text in EN)) missing.push(`${path.relative(SRC, file)}: ${text}`);
    }
  }
  expect(missing).toEqual([]);
});
