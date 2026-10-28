import type { ReactNode } from "react";

interface Props {
  label: string;
  onClick: () => void;
  active?: boolean;
  children: ReactNode;
}

/** Botão da barra de formatação. Não rouba o foco do editor ao ser clicado. */
export function ToolbarButton({ label, onClick, active, children }: Props) {
  return (
    <button
      type="button"
      className={active ? "tb on" : "tb"}
      aria-pressed={active}
      aria-label={label}
      title={label}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
