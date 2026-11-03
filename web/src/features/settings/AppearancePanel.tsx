import { Monitor, Moon, Sun } from "lucide-react";
import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { t } from "@/lib/i18n";
import { type Appearance, type Mode, readAppearance, saveAppearance } from "@/lib/theme";

const MODES: { id: Mode; label: string; Icon: typeof Sun }[] = [
  { id: "light", label: t("Claro"), Icon: Sun },
  { id: "dark", label: t("Escuro"), Icon: Moon },
  { id: "system", label: t("Sistema"), Icon: Monitor },
];

/** Painel "Aparência" (aberto pelo menu "Ajustes" da barra lateral): tema claro/escuro. */
export function AppearancePanel({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const group = useRef<HTMLDivElement>(null);
  const [look, setLook] = useState(readAppearance);
  const change = (patch: Partial<Appearance>) => {
    // Lê o que está gravado, e não o estado deste render: dois cliques seguidos não se atropelam.
    const next = { ...readAppearance(), ...patch };
    saveAppearance(next);
    setLook(next);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="gap-4 p-4 sm:max-w-xs"
        aria-describedby={undefined}
        onOpenAutoFocus={(e) => {
          // O foco cai na opção marcada, e não na primeira: só uma opção chama a atenção ao abrir.
          e.preventDefault();
          group.current?.querySelector<HTMLElement>("[aria-pressed=true]")?.focus();
        }}
      >
        <DialogTitle className="font-display text-lg font-extrabold tracking-tight">{t("Aparência")}</DialogTitle>
        <fieldset>
          <legend className="mb-2 rotulo">{t("Tema")}</legend>
          <div ref={group} className="grid grid-cols-3 gap-1 rounded-md bg-muted p-1">
            {MODES.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                aria-pressed={look.mode === id}
                onClick={() => change({ mode: id })}
                className="flex flex-col items-center gap-1 rounded-sm min-h-11 py-1.5 text-xs text-muted-foreground hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-muted aria-pressed:bg-primary aria-pressed:font-bold aria-pressed:text-primary-foreground"
              >
                <Icon className="size-4" aria-hidden /> {label}
              </button>
            ))}
          </div>
        </fieldset>
        <p className="text-xs text-muted-foreground">
          {t("Muda só o Studio, neste navegador. A cor do manual fica em Exportar manual.")}
        </p>
      </DialogContent>
    </Dialog>
  );
}
