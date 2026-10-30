import type { ReactNode } from "react";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";

interface Props {
  open: boolean;
  onClose: () => void;
  /** Retângulo na tela onde o balão se apoia (seleção de texto ou imagem). */
  getRect: () => DOMRect;
  label: string;
  /** Esc fechou o balão: quem usa decide para onde vai o foco (o balão não tem gatilho a que voltar). */
  onEscape?: () => void;
  children: ReactNode;
}

const MARGEM = 8;

/**
 * Área útil do editor: entre a barra fixa de cima e o rodapé, com margem. Medida ao abrir, porque
 * os dois são sticky e o rodapé muda de altura com o texto.
 */
function collisionPadding() {
  const bar = document.querySelector("[data-editor-toolbar]")?.getBoundingClientRect();
  const footer = document.querySelector("footer")?.getBoundingClientRect();
  return {
    top: Math.max(MARGEM, (bar?.bottom ?? 0) + MARGEM),
    bottom: Math.max(MARGEM, footer ? window.innerHeight - footer.top + MARGEM : 0),
    left: MARGEM,
    right: MARGEM,
  };
}

/** Balão preso a um ponto do editor, sem elemento de gatilho. Usado pelo link e pela imagem. */
export function AnchoredPopover({ open, onClose, getRect, label, onEscape, children }: Props) {
  return (
    <Popover open={open} onOpenChange={(next) => !next && onClose()}>
      <PopoverAnchor virtualRef={{ current: { getBoundingClientRect: getRect } }} />
      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={MARGEM}
        collisionPadding={collisionPadding()}
        aria-label={label}
        className="max-h-(--radix-popover-content-available-height) w-80 overflow-y-auto p-3 shadow-[0_8px_24px_-12px_rgb(21_26_51/0.35)]"
        onEscapeKeyDown={onEscape}
        onOpenAutoFocus={(e) => {
          // Foca o primeiro campo, não o balão inteiro.
          e.preventDefault();
          (e.currentTarget as HTMLElement | null)?.querySelector<HTMLElement>("input")?.focus();
        }}
      >
        {children}
      </PopoverContent>
    </Popover>
  );
}
