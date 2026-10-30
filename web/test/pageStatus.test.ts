import { describe, expect, it } from "vitest";
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
