export function slugify(title: string): string {
  const slug = title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/, "");
  return slug || "sem-titulo";
}

/** Texto obrigatório, sem espaços nas pontas. `what` entra na mensagem: "O título da página não pode ficar vazio." */
export function required(value: string, what: string): string {
  const v = value.trim();
  if (!v) throw new Error(`O ${what} não pode ficar vazio.`);
  return v;
}
