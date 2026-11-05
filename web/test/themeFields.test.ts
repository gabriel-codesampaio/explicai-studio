import { describe, expect, it } from "vitest";
import { commonHeading, headingsDiffer } from "../src/features/settings/ThemeFields";

const all = (c: string) => ({ cover: c, page: c, h1: c, h2: c, h3: c });

describe("títulos do manual", () => {
  it("cor comum só quando os cinco são iguais", () => {
    expect(commonHeading(all("#7a3fc4"))).toBe("#7a3fc4");
    expect(commonHeading({ ...all("#7a3fc4"), h2: "#0f7a55" })).toBeUndefined();
    expect(commonHeading({ h1: "#7a3fc4" })).toBeUndefined();
    expect(commonHeading(undefined)).toBeUndefined();
  });

  it("'Ajustar por nível' abre quando os níveis diferem", () => {
    expect(headingsDiffer(undefined)).toBe(false);
    expect(headingsDiffer(all("#7a3fc4"))).toBe(false);
    expect(headingsDiffer({ h1: "#7a3fc4" })).toBe(true);
    expect(headingsDiffer({ h1: "#151A33" })).toBe(false); // igual ao padrão
  });
});
