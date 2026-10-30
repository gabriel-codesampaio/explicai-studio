import { expect, it } from "vitest";
import { ApiError, errorMessage } from "../src/lib/api";

it("erro com código vira o texto da interface, com os parâmetros no formato do idioma", () => {
  const err = new ApiError("texto do servidor", "low-contrast", { label: "destaque", ratio: 1.4, min: 4.5 });
  expect(errorMessage(err)).toBe(
    "A cor de destaque tem contraste 1,4:1 com o branco; o mínimo é 4,5:1. Escolha uma cor mais escura.",
  );
});

it("código desconhecido usa a mensagem do servidor", () => {
  expect(errorMessage(new ApiError("texto do servidor", "outro"))).toBe("texto do servidor");
});

it("os nomes dos campos de cor mandados pelo núcleo têm tradução", async () => {
  const { EN } = await import("../src/lib/i18n.en");
  for (const label of [
    "destaque",
    "texto",
    "título da capa",
    "título da página",
    "título de nível 1",
    "título de nível 2",
    "título de nível 3",
  ]) {
    expect(EN[label]).toBeTruthy();
  }
});
