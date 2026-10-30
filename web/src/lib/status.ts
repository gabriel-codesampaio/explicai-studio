import type { PageStatus } from "./api";
import { t } from "./i18n";

/** Como cada etapa do fluxo de aprovação aparece no Studio. A cor sempre vem com o nome escrito. */
interface StatusInfo {
  id: PageStatus;
  label: string;
  hint: string;
  /** Token de cor do texto e da bolinha (tokens.css). Nunca o amarelo: ele é só de conteúdo e página ativa. */
  token: string;
}

const DRAFT: StatusInfo = { id: "rascunho", label: t("Rascunho"), hint: t("Ainda sendo escrita"), token: "grafite" };

export const STATUSES: StatusInfo[] = [
  DRAFT,
  { id: "revisao", label: t("Em revisão"), hint: t("Pronta para alguém conferir"), token: "cor-orange" },
  { id: "aprovado", label: t("Aprovado"), hint: t("Conferida, pode ir para o manual"), token: "cor-green" },
  { id: "publicado", label: t("Publicado"), hint: t("Já está no manual entregue"), token: "cobalto" },
];

export const statusOf = (id: PageStatus): StatusInfo => STATUSES.find((s) => s.id === id) ?? DRAFT;
