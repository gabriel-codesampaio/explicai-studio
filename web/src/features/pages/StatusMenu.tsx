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
import { STATUSES, statusOf } from "@/lib/status";
import { cn } from "@/lib/utils";

/** Bolinha de cor do status. Sempre acompanhada do nome, escrito ou para leitor de tela. */
export function StatusDot({ status, className }: { status: PageStatus; className?: string }) {
  return <span className={cn("inline-block size-2 shrink-0 rounded-full", statusOf(status).dot, className)} aria-hidden />;
}

/** Status da página no topo dela: rascunho, em revisão, aprovado ou publicado. */
export function StatusMenu({ status, onChange }: { status: PageStatus; onChange: (status: PageStatus) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Status da página: ${statusOf(status).label}`}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[13px] text-muted-foreground hover:bg-muted hover:text-foreground data-[state=open]:bg-muted"
        >
          <StatusDot status={status} /> {statusOf(status).label}
          <ChevronDown className="size-3" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Etapa da página</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={status} onValueChange={(v) => onChange(v as PageStatus)}>
          {STATUSES.map((s) => (
            <DropdownMenuRadioItem key={s.id} value={s.id} className="items-start">
              <span className="grid leading-tight">
                <span className="flex items-center gap-2">
                  <StatusDot status={s.id} /> {s.label}
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
