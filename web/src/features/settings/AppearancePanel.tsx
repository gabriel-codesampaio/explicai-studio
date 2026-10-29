import { Monitor, Moon, Palette, Sun } from "lucide-react";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ACCENTS, type Appearance, type Mode, readAppearance, saveAppearance } from "@/lib/theme";

const MODES: { id: Mode; label: string; Icon: typeof Sun }[] = [
  { id: "light", label: "Claro", Icon: Sun },
  { id: "dark", label: "Escuro", Icon: Moon },
  { id: "system", label: "Sistema", Icon: Monitor },
];

/** Botão "Aparência" da barra lateral: tema claro/escuro e cor de destaque do Studio. */
export function AppearancePanel() {
  const [look, setLook] = useState(readAppearance);
  const change = (patch: Partial<Appearance>) => {
    // Lê o que está gravado, e não o estado deste render: dois cliques seguidos não se atropelam.
    const next = { ...readAppearance(), ...patch };
    saveAppearance(next);
    setLook(next);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground data-[state=open]:bg-muted"
        >
          <Palette className="size-4" aria-hidden /> Aparência
        </button>
      </PopoverTrigger>
      <PopoverContent side="right" align="end" className="grid w-64 gap-4 p-3">
        <fieldset>
          <legend className="mb-2 text-sm font-bold">Tema</legend>
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
        <fieldset>
          <legend className="mb-2 text-sm font-bold">Cor de destaque</legend>
          <div className="flex gap-2.5">
            {ACCENTS.map((a) => (
              <button
                key={a.id}
                type="button"
                aria-pressed={look.accent === a.id}
                aria-label={a.label}
                title={a.label}
                onClick={() => change({ accent: a.id })}
                className="size-7 rounded-full ring-foreground ring-offset-2 ring-offset-popover aria-pressed:ring-2"
                style={{ background: a.swatch }}
              />
            ))}
          </div>
        </fieldset>
        <p className="text-xs text-muted-foreground">Muda só o Studio, neste navegador. O manual não é alterado.</p>
      </PopoverContent>
    </Popover>
  );
}
