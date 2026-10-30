import { ChevronDown } from "lucide-react";
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

/** Bolinha de cor do status. Rascunho é anel vazio, para a forma também diferenciar. Sempre vem com o nome escrito. */
export function StatusDot({ status, className }: { status: PageStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-block size-2 shrink-0 rounded-full",
        status === "rascunho" ? "border-[1.5px] border-current" : "bg-current",
        className,
      )}
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
            <DropdownMenuRadioItem key={s.id} value={s.id} className="items-start">
              <span className="grid leading-tight">
                <span className="flex items-center gap-2">
                  <StatusLabel status={s.id} />
                </span>
                <span className="text-xs text-muted-foreground">{s.hint}</span>
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
