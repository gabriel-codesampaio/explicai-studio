import type { PageStatus } from "./api";
import { t } from "./i18n";

/** Como cada etapa do fluxo de aprovação aparece no Studio. A cor sempre vem com o nome escrito. */
interface StatusInfo {
  id: PageStatus;
  label: string;
  hint: string;
  dot: string;
}

const DRAFT: StatusInfo = { id: "rascunho", label: t("Rascunho"), hint: t("Ainda sendo escrita"), dot: "bg-muted-foreground/50" };

export const STATUSES: StatusInfo[] = [
  DRAFT,
  { id: "revisao", label: t("Em revisão"), hint: t("Pronta para alguém conferir"), dot: "bg-marca" },
  { id: "aprovado", label: t("Aprovado"), hint: t("Conferida, pode ir para o manual"), dot: "bg-[#0f7a55]" },
  { id: "publicado", label: t("Publicado"), hint: t("Já está no manual entregue"), dot: "bg-primary" },
];

export const statusOf = (id: PageStatus): StatusInfo => STATUSES.find((s) => s.id === id) ?? DRAFT;
