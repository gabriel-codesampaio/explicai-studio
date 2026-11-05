import { defineConfig } from "vitest/config";

export default defineConfig({
  // Testes de componente importam como o editor: "@/lib/api".
  resolve: { alias: { "@": `${import.meta.dirname}/web/src` } },
  test: {
    // Limite fixo: a máquina da pessoa não pode ir a 100% de CPU.
    maxWorkers: 2,
    // Testes lentos se consertam (T-571), não se escondem com timeout.
    testTimeout: 10_000,
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
