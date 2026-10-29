import type { ReactNode } from "react";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";

interface Props {
  open: boolean;
  onClose: () => void;
  /** Retângulo na tela onde o balão se apoia (seleção de texto ou imagem). */
  getRect: () => DOMRect;
  label: string;
  children: ReactNode;
}

/** Balão preso a um ponto do editor, sem elemento de gatilho. Usado pelo link e pela imagem. */
export function AnchoredPopover({ open, onClose, getRect, label, children }: Props) {
  return (
    <Popover open={open} onOpenChange={(next) => !next && onClose()}>
      <PopoverAnchor virtualRef={{ current: { getBoundingClientRect: getRect } }} />
      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={8}
        aria-label={label}
        className="w-80 p-3 shadow-[0_8px_24px_-12px_rgb(21_26_51/0.35)]"
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
