import type { LucideIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  /** Atalho mostrado na dica, ex.: "Ctrl+B". */
  shortcut?: string;
  icon: LucideIcon;
  onClick: () => void;
  active?: boolean;
  /** Mostra o rótulo ao lado do ícone (ações principais, como "Colar print"; com atalho, ele aparece em mono ao lado). */
  showLabel?: boolean;
}

/**
 * Botão da barra de formatação. Não rouba o foco do editor ao ser clicado. Fica fora da ordem do Tab:
 * quem recebe o Tab é o seletor de bloco, e as setas andam pelos botões (ver useRovingFocus).
 */
export function ToolbarButton({ label, shortcut, icon: Icon, onClick, active, showLabel }: Props) {
  const button = (
    <button
      type="button"
      data-roving
      tabIndex={-1}
      aria-pressed={active}
      aria-label={label}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-muted-foreground [@media(pointer:coarse)]:h-11 [@media(pointer:coarse)]:min-w-11 [@media(pointer:coarse)]:justify-center transition-colors hover:bg-secondary hover:text-foreground",
        active && "bg-accent text-primary",
        showLabel && "shrink-0 border border-border px-2.5 text-sm font-bold whitespace-nowrap text-foreground",
      )}
    >
      <Icon className="size-4 shrink-0" aria-hidden />
      {showLabel && <span>{label}</span>}
      {showLabel && shortcut && (
        <kbd className="hidden font-mono text-[11px] font-normal text-muted-foreground sm:inline">{shortcut}</kbd>
      )}
    </button>
  );
  // Com rótulo à vista, a dica só repetiria o texto do botão.
  if (showLabel) return button;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent>
        {label}
        {shortcut && <kbd className="ml-2 font-mono text-[11px] opacity-70">{shortcut}</kbd>}
      </TooltipContent>
    </Tooltip>
  );
}
