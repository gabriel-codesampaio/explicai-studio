import { describe, expect, it } from "vitest";
import { json } from "../src/server/http.js";
import { matchRoute, type Route } from "../src/server/router.js";

const route = (method: string, path: string): Route => ({ method, path, handle: () => json(path) });
const routes = [
  route("GET", "/api/manuals"),
  route("GET", "/api/manuals/:slug"),
  route("PUT", "/api/manuals/:slug/pages/:id"),
  route("GET", "/files/:slug/*"),
  route("GET", "/*"),
];
const find = (method: string, path: string) => matchRoute(routes, method, path.split("/").filter(Boolean));

describe("roteador", () => {
  it("separa rotas fixas das com parâmetro", () => {
    expect(find("GET", "/api/manuals")?.route.path).toBe("/api/manuals");
    expect(find("GET", "/api/manuals/financeiro")).toMatchObject({ params: { slug: "financeiro" } });
  });

  it("captura vários parâmetros e respeita o método", () => {
    expect(find("PUT", "/api/manuals/m/pages/42")?.params).toEqual({ slug: "m", id: "42" });
    expect(find("DELETE", "/api/manuals/m/pages/42")).toBeNull();
  });

  it("guarda o resto do caminho no curinga", () => {
    expect(find("GET", "/files/m/assets/tela.png")).toMatchObject({ params: { slug: "m" }, rest: "assets/tela.png" });
  });

  it("usa a primeira rota da lista quando mais de uma serve", () => {
    expect(find("GET", "/editor/qualquer")?.route.path).toBe("/*");
    expect(find("GET", "/api/manuals")?.route.path).toBe("/api/manuals");
  });
});
