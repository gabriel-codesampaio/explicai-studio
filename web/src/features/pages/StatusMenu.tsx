import { Check, ChevronDown } from "lucide-react";
import type { CSSProperties } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { PageStatus } from "@/lib/api";
import { t } from "@/lib/i18n";
import { STATUSES, statusOf } from "@/lib/status";
import { cn } from "@/lib/utils";

/** Bolinha do status. Rascunho é anel vazio, publicado é alvo (anel com miolo), os outros são cheios: a forma também diferencia. Sempre vem com o nome escrito. */
export function StatusDot({ status, className, style }: { status: PageStatus; className?: string; style?: CSSProperties }) {
  return (
    <span
      className={cn(
        "inline-block size-2 shrink-0 rounded-full",
        status === "rascunho" && "border-[1.5px] border-current",
        status === "publicado" && "border-[1.5px] border-current bg-[radial-gradient(currentColor_35%,transparent_40%)]",
        status !== "rascunho" && status !== "publicado" && "bg-current",
        className,
      )}
      style={style}
      aria-hidden
    />
  );
}

/** Nome do status ao lado da bolinha, na cor da etapa (contraste de 4,5:1 medido em web/test/pageStatus.test.ts). */
export function StatusLabel({ status, className }: { status: PageStatus; className?: string }) {
  const info = statusOf(status);
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-1.5", className)} style={{ color: `var(--${info.token})` }}>
      <StatusDot status={status} />
      {info.label}
    </span>
  );
}

/** Só a bolinha, para a árvore estreita. O nome fica em tooltip e para leitor de tela: a cor nunca é o único sinal. */
export function StatusMark({ status, className }: { status: PageStatus; className?: string }) {
  const info = statusOf(status);
  return (
    <span
      title={info.label}
      className={cn("inline-flex shrink-0 items-center", className)}
      style={{ color: `var(--${info.token})` }}
    >
      <StatusDot status={status} />
      <span className="sr-only">{info.label}</span>
    </span>
  );
}

const LEGEND: PageStatus[] = ["revisao", "aprovado", "publicado"];

/** Legenda de uma linha para a árvore: rascunho não tem marca, os outros mostram bolinha. */
export function StatusLegend({ className }: { className?: string }) {
  return (
    <p
      className={cn("flex flex-wrap gap-x-2.5 text-[11px] text-muted-foreground", className)}
      title={t("Bolinha ao lado da página: etapa dela. Sem bolinha, é rascunho.")}
      aria-label={t("Bolinha ao lado da página: etapa dela. Sem bolinha, é rascunho.")}
    >
      {LEGEND.map((id) => (
        <span key={id} className="inline-flex items-center gap-1">
          <StatusDot status={id} style={{ color: `var(--${statusOf(id).token})` }} />
          {statusOf(id).label}
        </span>
      ))}
    </p>
  );
}

/** Status da página no topo dela: rascunho, em revisão, aprovado ou publicado. */
export function StatusMenu({ status, onChange }: { status: PageStatus; onChange: (status: PageStatus) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t("Status da página: {status}", { status: statusOf(status).label })}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium [@media(pointer:coarse)]:min-h-11 hover:bg-muted data-[state=open]:bg-muted"
        >
          <StatusLabel status={status} />
          <ChevronDown className="size-3 text-muted-foreground" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="text-xs text-muted-foreground">{t("Etapa da página")}</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={status} onValueChange={(v) => onChange(v as PageStatus)}>
          {STATUSES.map((s) => (
            <DropdownMenuRadioItem
              key={s.id}
              value={s.id}
              // Sem o ponto padrão: a bolinha da etapa é o indicador; o atual ganha fundo e check.
              indicator={false}
              className="group items-start gap-2.5 data-[state=checked]:bg-muted"
            >
              <span style={{ color: `var(--${s.token})` }} className="mt-1">
                <StatusDot status={s.id} />
              </span>
              <span className="grid flex-1 leading-tight">
                <span className="font-medium">{s.label}</span>
                <span className="text-xs text-muted-foreground">{s.hint}</span>
              </span>
              <Check className="mt-0.5 hidden size-4 text-muted-foreground group-data-[state=checked]:block" aria-hidden />
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
