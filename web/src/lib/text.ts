/** Sem acento, sem maiúsculas e sem espaços nas pontas: "Título" e "titulo" comparam iguais. */
export function fold(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

/** decodeURIComponent que não lança: um `%` solto (hash `#/%`, `100%.png`) é texto comum, não motivo para a tela cair. */
export function decodeComponent(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}
