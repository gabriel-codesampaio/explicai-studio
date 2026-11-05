import { ChevronDown } from "lucide-react";
import { useRef } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { t } from "@/lib/i18n";
import type { TemplateId } from "@/lib/templates";

interface Props {
  /** Sem modelo = página em branco. */
  onPick: (template?: TemplateId) => void;
}

/** Ao lado de "Nova página" (que cria em branco): escolhe um modelo no mesmo passo, sem diálogo. */
export function NewPageMenu({ onPick }: Props) {
  const picked = useRef(false);
  const pick = (template?: TemplateId) => {
    picked.current = true;
    onPick(template);
  };
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
      {/* Escolher um modelo não devolve o foco ao gatilho (roubaria o do título da página criada); Esc devolve. */}
      <DropdownMenuContent
        align="end"
        onCloseAutoFocus={(e) => {
          if (picked.current) e.preventDefault();
          picked.current = false;
        }}
      >
        <DropdownMenuItem onSelect={() => pick()}>{t("Em branco")}</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => pick("task")}>{t("Tarefa passo a passo")}</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => pick("reference")}>{t("Referência de campos")}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
