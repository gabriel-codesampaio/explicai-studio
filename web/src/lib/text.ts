/** Sem acento, sem maiúsculas e sem espaços nas pontas: "Título" e "titulo" comparam iguais. */
export function fold(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}
