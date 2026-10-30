import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts", "web/src/**/*.{ts,tsx}"],
      exclude: ["**/*.d.ts"],
      reporter: ["text-summary", "text"],
      // Medido em 2026-10-30: 44.96 / 37.2 / 36.63 / 44.86. Piso = medido menos 2; sobe junto com os testes.
      thresholds: { statements: 42, branches: 35, functions: 34, lines: 42 },
    },
  },
});
