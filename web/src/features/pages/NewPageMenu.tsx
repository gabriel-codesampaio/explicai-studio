import { ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { t } from "@/lib/i18n";
import type { TemplateId } from "@/lib/templates";

interface Props {
  /** Sem modelo = página em branco. */
  onPick: (template?: TemplateId) => void;
}

/** Ao lado de "Nova página" (que cria em branco): escolhe um modelo no mesmo passo, sem diálogo. */
export function NewPageMenu({ onPick }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t("Escolher um modelo de página")}
          className="flex size-7 items-center justify-center rounded-md text-primary outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-accent [@media(pointer:coarse)]:size-11"
        >
          <ChevronDown className="size-3.5" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      {/* O Radix devolveria o foco ao gatilho e roubaria o do título da página recém-criada. */}
      <DropdownMenuContent align="end" onCloseAutoFocus={(e) => e.preventDefault()}>
        <DropdownMenuItem onSelect={() => onPick()}>{t("Em branco")}</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onPick("task")}>{t("Tarefa passo a passo")}</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onPick("reference")}>{t("Referência de campos")}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
