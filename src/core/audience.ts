import { updateManual } from "./manuals.js";

/** Lista de perfis limpa (sem vazios nem repetidos). Texto solto vira lista de um; vazio ou tipo errado: undefined. */
export function parseAudience(value: unknown): string[] | undefined {
  const list = typeof value === "string" ? [value] : Array.isArray(value) ? value : [];
  const clean = [
    ...new Set(
      list
        .filter((v): v is string => typeof v === "string")
        .map((v) => v.trim())
        .filter(Boolean),
    ),
  ];
  return clean.length ? clean : undefined;
}

/** Põe os perfis da página na lista do manual (`audiences`), para o Studio e o MCP oferecerem os que já existem. */
export function registerAudiences(dir: string, audience: string[] | undefined): Promise<void> {
  if (!audience?.length) return Promise.resolve();
  return updateManual(dir, (meta) => {
    const all = [...new Set([...(meta.audiences ?? []), ...audience])];
    if (all.length !== meta.audiences?.length) meta.audiences = all;
  });
}

/** O perfil vê a página? Sem restrição própria, vale a do pai (`parentOk`); com ela, vale o cruzamento das duas. */
export function seesPage(audience: string[] | undefined, profile: string | undefined, parentOk = true): boolean {
  return parentOk && (profile === undefined || !audience || audience.includes(profile));
}
