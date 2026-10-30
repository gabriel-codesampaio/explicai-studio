import { expect, it } from "vitest";
import { ApiError } from "../src/lib/api";
import { errorKind, plainTitle, splitHighlight, technicalCode } from "../src/lib/errorPages";

it("separa o trecho do marca-texto do resto do título", () => {
  expect(splitHighlight("Não achamos *esta página*")).toEqual([
    { text: "Não achamos ", mark: false },
    { text: "esta página", mark: true },
  ]);
  expect(splitHighlight("*Só* isto")).toEqual([
    { text: "Só", mark: true },
    { text: " isto", mark: false },
  ]);
  expect(splitHighlight("Sem destaque")).toEqual([{ text: "Sem destaque", mark: false }]);
});

it("tira os asteriscos do título puro", () => {
  expect(plainTitle("Algo quebrou *nesta tela*")).toBe("Algo quebrou nesta tela");
});

it("reconhece servidor fora, acesso recusado e erro do servidor", () => {
  expect(errorKind(new ApiError("x", "offline", {}, 502))).toBe("offline");
  expect(errorKind(new ApiError("x", "forbidden-host", {}, 403))).toBe("forbidden");
  expect(errorKind(new ApiError("x", "forbidden-origin", {}, 403))).toBe("forbidden");
  expect(errorKind(new ApiError("x", undefined, {}, 500))).toBe("server");
  expect(errorKind(new Error("boom"))).toBe("server");
});

it("monta o código técnico copiável", () => {
  expect(technicalCode(new ApiError("x", "offline", {}, 502))).toBe("HTTP 502");
  expect(technicalCode(new ApiError("x", "offline"))).toBe("fetch failed");
  expect(technicalCode(new ApiError("x", "forbidden-host", {}, 403))).toBe("HTTP 403 forbidden-host");
  expect(technicalCode(new TypeError("boom"))).toBe("TypeError: boom");
});
