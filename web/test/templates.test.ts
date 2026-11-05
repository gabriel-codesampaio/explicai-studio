import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, it } from "vitest";
import { addPage, checkManual, createManual } from "../../src/core/index.js";
import { type TemplateId, templateBody } from "../src/lib/templates";

const IDS: TemplateId[] = ["task", "reference"];

it("cada modelo existe em pt e en, com texto diferente", () => {
  for (const id of IDS) {
    const pt = templateBody(id, "pt-BR");
    const en = templateBody(id, "en");
    expect(pt.length).toBeGreaterThan(50);
    expect(en).not.toBe(pt);
    expect(templateBody(id, "en-US")).toBe(en);
    expect(templateBody(id, "PT")).toBe(pt);
  }
});

it("o modelo de tarefa tem passos numerados, cada um com Resultado:", () => {
  for (const [lang, label] of [
    ["pt-BR", "Resultado:"],
    ["en", "Result:"],
  ] as const) {
    const body = templateBody("task", lang);
    const steps = body.match(/^\d+\. /gm) ?? [];
    expect(steps.length).toBeGreaterThanOrEqual(2);
    expect(body.split(label).length - 1).toBe(steps.length);
  }
});

it("o exemplo de cada modelo fica entre colchetes", () => {
  for (const id of IDS) {
    for (const lang of ["pt-BR", "en"]) {
      const body = templateBody(id, lang);
      expect(body).toMatch(/\[[^\]]+\]/);
      expect(body).not.toMatch(/\]\(/); // colchete de exemplo não vira link
    }
  }
});

it("o modelo de tarefa nasce sem achado do check além de 'sem print'", async () => {
  for (const [language, kind] of [
    ["pt-BR", "no-image"],
    ["en", "no-image"],
  ] as const) {
    const { dir } = await createManual(await mkdtemp(path.join(tmpdir(), "expl-")), { title: "M", language });
    await addPage(dir, { title: "T", body: templateBody("task", language) });
    await addPage(dir, { title: "R", body: templateBody("reference", language) });
    expect((await checkManual(dir)).map((f) => f.kind)).toEqual([kind]);
  }
});
