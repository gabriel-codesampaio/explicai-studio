import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { FONTS, MONO } from "../src/core/export/fonts.js";

const pkg = JSON.parse(readFileSync("package.json", "utf8")) as {
  bin: unknown;
  engines: { node: string };
  exports: Record<string, { default: string }>;
  repository: { url: string };
  keywords: string[];
  [k: string]: unknown;
};

describe("pacote npm", () => {
  // --ignore-scripts: não dispara o prepublishOnly (check + build) só para listar os arquivos.
  const packed = JSON.parse(execSync("npm pack --dry-run --json --ignore-scripts", { encoding: "utf8" }))[0];
  const paths: string[] = packed.files.map((f: { path: string }) => f.path);

  it("leva só dist, fonts, LICENSE, README, CHANGELOG e package.json", () => {
    const fora = paths.filter(
      (p) => !/^(dist|fonts)\//.test(p) && !["LICENSE", "README.md", "CHANGELOG.md", "package.json"].includes(p),
    );
    expect(fora).toEqual([]);
    for (const p of ["LICENSE", "README.md", "CHANGELOG.md", "package.json"]) expect(paths).toContain(p);
  });

  it("não leva mapas de código", () => {
    expect(paths.filter((p) => p.endsWith(".map"))).toEqual([]);
  });

  it("leva a licença OFL de cada fonte que o export usa", () => {
    for (const f of [...FONTS, MONO]) expect(paths, f.id).toContain(`fonts/OFL-${f.id}.txt`);
  });

  it("declara bin, engines, exports e metadados", () => {
    expect(pkg.bin).toEqual({ explicai: "dist/cli.js" });
    expect(pkg.engines.node).toMatch(/^>=22/);
    expect(pkg.exports["./core"]?.default).toBe("./dist/core/index.js");
    expect(pkg.repository.url).toContain("gabriel-codesampaio/explicai-studio");
    for (const k of ["description", "homepage", "bugs", "license", "keywords"]) expect(pkg[k], k).toBeTruthy();
    expect(pkg.keywords).toEqual(expect.arrayContaining(["manual", "documentation", "pdf", "markdown", "cli", "explicai"]));
  });

  it("a CLI abre com shebang do Node", () => {
    expect(readFileSync("src/cli.ts", "utf8").startsWith("#!/usr/bin/env node\n")).toBe(true);
  });
});
