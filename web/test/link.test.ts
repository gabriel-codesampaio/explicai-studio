import { describe, expect, it } from "vitest";
import { checkHref, pageHref } from "../src/lib/links";

const ok = (raw: string) => {
  const r = checkHref(raw);
  return r.ok ? r.href : null;
};

describe("endereço do link", () => {
  it("completa https:// quando falta o protocolo", () => {
    expect(ok("codesampa.io")).toBe("https://codesampa.io");
    expect(ok("  exemplo.com/ajuda ")).toBe("https://exemplo.com/ajuda");
  });

  it("mantém links completos, âncoras, caminhos, páginas e e-mail", () => {
    for (const href of ["http://localhost:3000", "https://a.b", "#cadastro", "/pagina", "./clientes.md", "mailto:a@b.com"]) {
      expect(ok(href)).toBe(href);
    }
  });

  it("vazio continua vazio (remove o link)", () => {
    expect(ok("   ")).toBe("");
  });

  it("recusa texto com espaço, sem domínio ou com protocolo perigoso", () => {
    expect(checkHref("clientes painel")).toMatchObject({ ok: false, error: expect.stringMatching(/espaços/) });
    expect(checkHref("clientes")).toMatchObject({ ok: false, error: expect.stringMatching(/domínio/) });
    expect(checkHref("javascript:alert(1)")).toMatchObject({ ok: false });
  });

  it("monta o link para outra página do manual", () => {
    expect(pageHref("pages/cadastrar-cliente.md")).toBe("./cadastrar-cliente.md");
  });
});
