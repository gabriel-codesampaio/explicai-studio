import { Monitor, Moon, Sun } from "lucide-react";
import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { t } from "@/lib/i18n";
import { type Appearance, type Mode, readAppearance, saveAppearance, useResolvedTheme } from "@/lib/theme";

const MODES: { id: Mode; label: string; Icon: typeof Sun }[] = [
  { id: "light", label: t("Claro"), Icon: Sun },
  { id: "dark", label: t("Escuro"), Icon: Moon },
  { id: "system", label: t("Sistema"), Icon: Monitor },
];

/** Painel "Tema do Studio" (aberto pelo menu "Ajustes" da barra lateral): tema claro/escuro. */
export function AppearancePanel({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const group = useRef<HTMLDivElement>(null);
  const [look, setLook] = useState(readAppearance);
  const resolved = useResolvedTheme();
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
          // O foco cai na opção marcada (ou na primeira, se nenhuma estiver): só uma opção chama a atenção ao abrir.
          e.preventDefault();
          (
            group.current?.querySelector<HTMLElement>("[aria-pressed=true]") ??
            group.current?.querySelector<HTMLElement>("button")
          )?.focus();
        }}
      >
        <DialogTitle className="font-display text-lg font-extrabold tracking-tight">{t("Tema do Studio")}</DialogTitle>
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
          {look.mode === "system" && (
            <p className="mt-2 text-xs text-muted-foreground">
              {resolved === "dark" ? t("Agora está escuro, como no seu sistema.") : t("Agora está claro, como no seu sistema.")}
            </p>
          )}
        </fieldset>
        <p className="text-xs text-muted-foreground">
          {t("Muda só o Studio, neste navegador. Cores e fontes do manual ficam em Ajustes, Aparência do manual.")}
        </p>
      </DialogContent>
    </Dialog>
  );
}
