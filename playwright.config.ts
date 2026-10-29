import { defineConfig } from "@playwright/test";

// E2E: o Studio compilado num navegador de verdade. Rode `npm run build` antes (o test:e2e já faz).
export default defineConfig({
  testDir: "e2e",
  testMatch: "**/*.e2e.ts",
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:4400",
    // Usa o Chrome instalado na máquina, sem baixar outro navegador.
    channel: "chrome",
    locale: "pt-BR",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "node e2e/serve.mjs",
    url: "http://localhost:4400",
    reuseExistingServer: false,
    stdout: "pipe",
  },
});
