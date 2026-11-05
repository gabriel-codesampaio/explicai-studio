import { expect, it } from "vitest";
import type { TreeItem } from "../src/lib/api";
import { EN } from "../src/lib/i18n.en";
import { isStale, reviewedLabel, staleOnly, today } from "../src/lib/reviewed";

const now = new Date("2026-11-05T12:00:00");
const item = (id: string, reviewed?: string, children: TreeItem[] = []): TreeItem => ({
  id,
  title: id,
  status: "rascunho",
  file: `${id}.md`,
  ...(reviewed ? { reviewed } : {}),
  children,
});

it("today usa o dia local", () => {
  expect(today(new Date(2026, 10, 5, 23, 59))).toBe("2026-11-05");
});

it("isStale: sem data, inválida ou com mais de 90 dias", () => {
  expect(isStale(undefined, now)).toBe(true);
  expect(isStale("ontem", now)).toBe(true);
  expect(isStale("2026-08-07", now)).toBe(false);
  expect(isStale("2026-08-06", now)).toBe(true);
});

it("rótulo: nunca conferida ou a data; as duas frases têm tradução", () => {
  expect(reviewedLabel(undefined)).toBe("Nunca conferida");
  expect(reviewedLabel("2026-11-05")).toMatch(/^Conferida em .*2026/);
  expect("Nunca conferida" in EN && "Conferida em {data}" in EN).toBe(true);
});

it("staleOnly mantém a mãe de uma página não conferida e tira o ramo em dia", () => {
  const tree = [
    item("fresca", "2026-11-01", [item("filha-velha", "2025-01-01")]),
    item("ok", "2026-11-01", [item("ok2", "2026-10-01")]),
    item("sem-data"),
  ];
  const out = staleOnly(tree, now);
  expect(out.map((i) => i.id)).toEqual(["fresca", "sem-data"]);
  expect(out[0]?.children.map((i) => i.id)).toEqual(["filha-velha"]);
});
