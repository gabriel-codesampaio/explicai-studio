// @vitest-environment happy-dom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { DiskConflictBanner } from "../src/features/errors/DiskConflictBanner";
import type { Page } from "../src/lib/api";
import { conflictDiff, textDiff } from "../src/lib/conflictDiff";

afterEach(cleanup);

it("textDiff devolve só o miolo que difere", () => {
  expect(textDiff("a\nb\nc", "a\nB\nc")).toEqual({ mine: "b", disk: "B", lines: 1 });
  expect(textDiff("a\nb", "a\nb\nc\nd")).toEqual({ mine: "", disk: "c\nd", lines: 2 });
  expect(textDiff("igual", "igual")).toBeNull();
});

it("conflictDiff compara o corpo da fila com o do disco, ou o título se só ele mudou", () => {
  const disk = { title: "Novo", body: "x\ny" } as Page;
  expect(conflictDiff({ body: "x\nz" }, disk)).toEqual({ mine: "z", disk: "y", lines: 1 });
  expect(conflictDiff({ title: "Velho" }, disk)).toEqual({ mine: "Velho", disk: "Novo", lines: 1 });
  expect(conflictDiff(undefined, disk)).toBeNull();
});

it("a faixa mostra o trecho do disco e o do usuário, e mantém os dois botões", () => {
  render(
    <DiskConflictBanner diff={{ disk: "linha do disco", mine: "linha minha", lines: 1 }} onReload={() => {}} onKeep={() => {}} />,
  );
  expect(screen.getByText("linha do disco")).toBeTruthy();
  expect(screen.getByText("linha minha")).toBeTruthy();
  expect(screen.getByRole("button", { name: /Manter a minha versão/ })).toBeTruthy();
  expect(screen.getByRole("button", { name: /Recarregar do disco/ })).toBeTruthy();
});
