// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { toolForKey } from "../src/lib/toolShortcuts";

const key = (k: string, extra: Partial<Parameters<typeof toolForKey>[0]> = {}) => ({ key: k, ...extra });

describe("toolForKey", () => {
  it("mapeia V, M, D, S, A e O para as ferramentas, sem diferenciar maiúscula", () => {
    expect(toolForKey(key("v"))).toBe("select");
    expect(toolForKey(key("M"))).toBe("marker");
    expect(toolForKey(key("d"))).toBe("highlight");
    expect(toolForKey(key("s"))).toBe("arrow");
    expect(toolForKey(key("a"))).toBe("hotspot");
    expect(toolForKey(key("o"))).toBe("redact");
    expect(toolForKey(key("O"))).toBe("redact");
    expect(toolForKey(key("r"))).toBe("crop");
  });

  it("ignora outras teclas", () => {
    expect(toolForKey(key("x"))).toBeNull();
    expect(toolForKey(key("Enter"))).toBeNull();
  });

  it("ignora com Ctrl, Alt ou Meta", () => {
    expect(toolForKey(key("a", { ctrlKey: true }))).toBeNull();
    expect(toolForKey(key("a", { altKey: true }))).toBeNull();
    expect(toolForKey(key("a", { metaKey: true }))).toBeNull();
  });

  it("ignora enquanto se digita num campo", () => {
    for (const html of ["<input>", "<textarea></textarea>", "<select></select>", '<div contenteditable="true"></div>']) {
      const host = document.createElement("div");
      host.innerHTML = html;
      expect(toolForKey(key("a", { target: host.firstElementChild }))).toBeNull();
    }
  });
});
