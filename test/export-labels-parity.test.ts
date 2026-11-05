import { expect, it } from "vitest";
import { labelsFor } from "../src/core/export/labels.js";

// O tipo Labels já obriga as mesmas chaves; aqui cobre o que o tipo não pega (callouts, vazios, funções).
const pt = labelsFor("pt-BR");
const en = labelsFor("en");

it("rótulos do HTML exportado: pt e en têm os mesmos callouts e nenhum texto vazio", () => {
  expect(Object.keys(en.callouts).sort()).toEqual(Object.keys(pt.callouts).sort());
  for (const l of [pt, en]) {
    const texts = Object.values(l).flatMap((v) =>
      typeof v === "function" ? [v(2, 3), v("x")] : typeof v === "string" ? [v] : Object.values(v),
    );
    expect(texts.every((s) => String(s).trim().length > 0)).toBe(true);
  }
  expect(Object.keys(en).sort()).toEqual(Object.keys(pt).sort());
});
