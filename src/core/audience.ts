import { ExplicaiError } from "./errors.js";

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

/** Perfil escolhido para exportar: recusa nome fora da lista do manual, quando ela existe. */
export function checkAudience(audience: string | undefined, known: string[] | undefined): string | undefined {
  const name = audience?.trim();
  if (!name) return undefined;
  if (known?.length && !known.includes(name)) {
    throw new ExplicaiError("unknown-audience", `Público "${name}" não existe neste manual. Use ${known.join(", ")}.`);
  }
  return name;
}

/** O perfil vê a página? Sem restrição própria, vale a do pai (`parentOk`); com ela, vale o cruzamento das duas. */
export function seesPage(audience: string[] | undefined, profile: string | undefined, parentOk = true): boolean {
  return parentOk && (profile === undefined || !audience || audience.includes(profile));
}
