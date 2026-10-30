import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ago } from "../src/lib/time";

const NOW = Date.parse("2026-10-30T12:00:00Z");
const past = (ms: number) => new Date(NOW - ms).toISOString();

beforeEach(() => vi.useFakeTimers().setSystemTime(NOW));
afterEach(() => vi.useRealTimers());

describe("ago", () => {
  it("diz que foi agora há pouco dentro do mesmo minuto", () => {
    expect(ago(past(20_000))).toBe("agora há pouco");
  });

  it("usa minutos, horas e dias conforme a distância", () => {
    expect(ago(past(5 * 60_000))).toBe("há 5 minutos");
    expect(ago(past(3 * 3_600_000))).toBe("há 3 horas");
    expect(ago(past(24 * 3_600_000))).toBe("ontem");
    expect(ago(past(3 * 86_400_000))).toBe("há 3 dias");
  });

  it("vira hora aos 60 minutos", () => {
    expect(ago(past(59 * 60_000))).toBe("há 59 minutos");
    expect(ago(past(60 * 60_000))).toBe("há 1 hora");
  });
});
