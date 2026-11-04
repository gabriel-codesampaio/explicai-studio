import { describe, expect, it } from "vitest";
import { COVER_MAX as CORE_COVER_MAX, FOOTER_MAX as CORE_FOOTER_MAX, coverLines as coreLines } from "../../src/core/index";
import { COVER_MAX, coverLines, FOOTER_MAX, suggestDate } from "../src/lib/cover";

describe("prévia da capa espelha o export", () => {
  it("mesmos limites e mesmas linhas, na mesma ordem", () => {
    expect([COVER_MAX, FOOTER_MAX]).toEqual([CORE_COVER_MAX, CORE_FOOTER_MAX]);
    for (const cover of [
      undefined,
      {},
      { date: "d", subtitle: " s ", version: "  " },
      { author: "a", date: "d", version: "v", subtitle: "s" },
    ]) {
      expect(coverLines(cover)).toEqual(coreLines(cover));
    }
    expect(coverLines({ date: "d", author: "a", subtitle: "s", version: "v" })).toEqual(["s", "a", "v", "d"]);
  });

  it("sugere mês e ano no idioma", () => {
    expect(suggestDate("pt-BR", new Date(2026, 9, 15))).toBe("outubro de 2026");
    expect(suggestDate("en-US", new Date(2026, 9, 15))).toBe("October 2026");
  });
});
