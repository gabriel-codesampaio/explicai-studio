import { t } from "./i18n";
export type HrefCheck = { ok: true; href: string } | { ok: false; error: string };

/**
 * Confere o endereço digitado no balão de link. Aceita URL web, e-mail, âncora (#secao),
 * caminho do site (/ajuda) e outra página do manual (./pagina.md). Sem protocolo, ganha https://.
 */
export function checkHref(raw: string): HrefCheck {
  const href = raw.trim();
  if (!href) return { ok: true, href: "" };
  if (/\s/.test(href))
    return { ok: false, error: t("Endereço não pode ter espaços. Para ligar a outra página, escolha na lista.") };
  if (/^(#|\/|\.\/)/.test(href) || /^mailto:[^@]+@[^@]+$/i.test(href)) return { ok: true, href };
  const full = /^[a-z][a-z0-9+.-]*:/i.test(href) ? href : `https://${href}`;
  try {
    const url = new URL(full);
    if (!["http:", "https:"].includes(url.protocol)) return { ok: false, error: t("Use um endereço http, https ou mailto.") };
    if (!url.hostname.includes(".") && url.hostname !== "localhost") {
      return { ok: false, error: t("Falta o domínio, por exemplo: exemplo.com.br") };
    }
    return { ok: true, href: full };
  } catch {
    return { ok: false, error: t("Endereço inválido. Exemplo: https://exemplo.com.br") };
  }
}

/** Link para outra página do manual: todas ficam em pages/, então é sempre ./arquivo.md */
export function pageHref(file: string): string {
  return `./${file.split("/").pop() ?? file}`;
}
