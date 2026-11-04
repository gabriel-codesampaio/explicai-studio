import { ChevronDown, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

interface Props {
  open: boolean;
  title: string;
  /** Estado com o painel fechado, como "1 área a ocultar"; aberto, o corpo já o mostra. */
  status: string;
  onToggle: () => void;
  children: ReactNode;
}

/** Painel de operação pendente: o cabeçalho está sempre ali; o corpo abre com a ferramenta ativa, para não empurrar a Legenda. */
export function Pending({ open, title, status, onToggle, children }: Props) {
  const Chevron = open ? ChevronDown : ChevronRight;
  return (
    <div className="grid gap-2">
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className="flex min-h-9 items-center gap-2 rounded-md border border-border px-3 text-left text-sm hover:bg-muted [@media(pointer:coarse)]:min-h-11"
      >
        <Chevron className="size-4 shrink-0" aria-hidden />
        <span className="font-bold">{title}</span>
        {!open && <span className="ml-auto text-muted-foreground">{status}</span>}
      </button>
      {open && children}
    </div>
  );
}
