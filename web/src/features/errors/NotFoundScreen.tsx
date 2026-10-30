import { EmptyState } from "@/components/EmptyState";
import { t } from "@/lib/i18n";
import { CopyCode } from "./CopyCode";

interface Props {
  kind: "manual" | "page";
  /** O endereço que não foi achado, ex.: "#/financeiro/pagina-antiga". */
  address: string;
  action: { label: string; onClick: () => void };
  secondary?: { label: string; onClick: () => void };
}

export function NotFoundScreen({ kind, address, action, secondary }: Props) {
  return (
    <EmptyState
      alert
      title={kind === "manual" ? t("Não achamos este manual") : t("Não achamos esta página")}
      action={action}
      extra={
        <>
          {secondary && (
            <button
              type="button"
              onClick={secondary.onClick}
              className="[@media(pointer:coarse)]:min-h-11 rounded-md px-1 font-bold text-primary underline-offset-2 hover:underline"
            >
              {secondary.label}
            </button>
          )}
          <CopyCode code={`404 ${address}`} />
        </>
      }
    >
      {kind === "manual"
        ? t("O link pode estar antigo, ou o manual foi renomeado, movido ou apagado da pasta.")
        : t("O link pode estar antigo, ou a página foi excluída ou movida para outro lugar do manual.")}
    </EmptyState>
  );
}
