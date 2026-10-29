import { Monitor, Moon, Palette, Sun } from "lucide-react";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { type Lang, lang, setLang, t } from "@/lib/i18n";
import { type Appearance, type Mode, readAppearance, saveAppearance } from "@/lib/theme";

const MODES: { id: Mode; label: string; Icon: typeof Sun }[] = [
  { id: "light", label: t("Claro"), Icon: Sun },
  { id: "dark", label: t("Escuro"), Icon: Moon },
  { id: "system", label: t("Sistema"), Icon: Monitor },
];

/** Cada idioma aparece escrito nele mesmo, para quem não lê o idioma atual achar o seu. */
const LANGS: { id: Lang; label: string }[] = [
  { id: "pt-BR", label: "Português" },
  { id: "en", label: "English" },
];

/** Botão "Aparência" da barra lateral: tema claro/escuro e idioma do Studio. */
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
          <Palette className="size-4" aria-hidden /> {t("Aparência")}
        </button>
      </PopoverTrigger>
      <PopoverContent side="right" align="end" className="grid w-64 gap-4 p-3">
        <fieldset>
          <legend className="mb-2 text-sm font-bold">{t("Tema")}</legend>
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
          <legend className="mb-2 text-sm font-bold">{t("Idioma da interface")}</legend>
          <div className="grid grid-cols-2 gap-1 rounded-md bg-muted p-1">
            {LANGS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                lang={id}
                aria-pressed={lang === id}
                onClick={() => lang !== id && setLang(id)}
                className="rounded-sm py-1.5 text-xs text-muted-foreground hover:text-foreground aria-pressed:bg-card aria-pressed:font-bold aria-pressed:text-foreground aria-pressed:shadow-xs"
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>
        <p className="text-xs text-muted-foreground">
          {t("Muda só o Studio, neste navegador. A cor do manual fica em Exportar manual.")}
        </p>
      </PopoverContent>
    </Popover>
  );
}
