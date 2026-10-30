import { ErrorPage } from "@/components/ErrorPage";
import { t } from "@/lib/i18n";

interface Props {
  kind: "manual" | "page";
  /** O endereço que não foi achado, ex.: "#/financeiro/pagina-antiga". */
  address: string;
  action: { label: string; onClick: () => void };
  secondary?: { label: string; onClick: () => void };
}

export function NotFoundScreen({ kind, address, action, secondary }: Props) {
  return (
    <ErrorPage
      title={kind === "manual" ? t("Não achamos *este manual*") : t("Não achamos *esta página*")}
      action={action}
      secondary={secondary}
      technical={`404 ${address}`}
    >
      {kind === "manual"
        ? t("O link pode estar antigo, ou o manual foi renomeado, movido ou apagado da pasta.")
        : t("O link pode estar antigo, ou a página foi excluída ou movida para outro lugar do manual.")}
    </ErrorPage>
  );
}
