import { Monitor, Moon, Sun } from "lucide-react";
import { useState } from "react";
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
  const [look, setLook] = useState(readAppearance);
  const change = (patch: Partial<Appearance>) => {
    // Lê o que está gravado, e não o estado deste render: dois cliques seguidos não se atropelam.
    const next = { ...readAppearance(), ...patch };
    saveAppearance(next);
    setLook(next);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-4 p-4 sm:max-w-xs" aria-describedby={undefined}>
        <DialogTitle className="font-display text-lg font-extrabold tracking-tight">{t("Aparência")}</DialogTitle>
        <fieldset>
          <legend className="mb-2 rotulo">{t("Tema")}</legend>
          <div className="grid grid-cols-3 gap-1 rounded-md bg-muted p-1">
            {MODES.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                aria-pressed={look.mode === id}
                onClick={() => change({ mode: id })}
                className="flex flex-col items-center gap-1 rounded-sm py-1.5 text-xs text-muted-foreground hover:text-foreground aria-pressed:bg-card aria-pressed:font-bold aria-pressed:text-foreground aria-pressed:shadow-xs"
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
