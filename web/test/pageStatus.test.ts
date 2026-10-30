import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { contrast } from "../../src/core/export/color";
import { STATUSES, statusOf } from "../src/lib/status";

describe("status da página", () => {
  it("lista as quatro etapas na ordem do fluxo", () => {
    expect(STATUSES.map((s) => s.id)).toEqual(["rascunho", "revisao", "aprovado", "publicado"]);
  });

  it("cada etapa tem nome e dica escritos", () => {
    for (const s of STATUSES) {
      expect(s.label).not.toBe("");
      expect(s.hint).not.toBe("");
    }
    expect(statusOf("revisao").label).toBe("Em revisão");
  });

  it("status desconhecido cai em rascunho", () => {
    expect(statusOf("inventado" as never).id).toBe("rascunho");
  });
});

describe("cor do texto do status", () => {
  const tokens = readFileSync(path.join(import.meta.dirname, "..", "src", "styles", "tokens.css"), "utf8");
  const [light = "", dark = ""] = tokens.split(':root[data-theme="dark"]');
  const hex = (block: string, name: string) =>
    new RegExp(`--${name}: *(#[0-9a-f]{6})`).exec(block)?.[1] ?? new RegExp(`--${name}: *(#[0-9a-f]{6})`).exec(light)?.[1] ?? "";

  it("tem contraste de 4,5:1 no papel, na superfície e no hover, nos dois temas", () => {
    for (const [block, tema] of [
      [light, "claro"],
      [dark, "escuro"],
    ] as const) {
      for (const s of STATUSES) {
        for (const bg of ["papel", "superficie", "muted"]) {
          expect(contrast(hex(block, s.token), hex(block, bg)), `${s.id} no ${tema} sobre ${bg}`).toBeGreaterThanOrEqual(4.5);
        }
      }
    }
  });

  it("não usa o amarelo da marca, que é só de conteúdo e página ativa", () => {
    for (const s of STATUSES) expect(s.token).not.toMatch(/marca/);
  });
});
