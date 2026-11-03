import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { type Lang, lang, setLang, t } from "@/lib/i18n";

/** Cada idioma aparece escrito nele mesmo, para quem não lê o idioma atual achar o seu. */
export const LANGS: { id: Lang; label: string }[] = [
  { id: "pt-BR", label: "Português" },
  { id: "en", label: "English" },
];

/** Painel "Idioma" (aberto pelo menu "Ajustes" da barra lateral): idioma do Studio, neste navegador. */
export function LanguagePanel({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-4 p-4 sm:max-w-xs" aria-describedby={undefined}>
        <DialogTitle className="font-display text-lg font-extrabold tracking-tight">{t("Idioma")}</DialogTitle>
        <fieldset aria-label={t("Idioma da interface")} className="grid grid-cols-2 gap-1 rounded-md bg-muted p-1">
          {LANGS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              lang={id}
              aria-pressed={lang === id}
              onClick={() => lang !== id && setLang(id)}
              className="rounded-sm min-h-11 py-1.5 text-xs text-muted-foreground hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-muted aria-pressed:bg-primary aria-pressed:font-bold aria-pressed:text-primary-foreground"
            >
              {label}
            </button>
          ))}
        </fieldset>
        <p className="text-xs text-muted-foreground">{t("Muda só o Studio, neste navegador.")}</p>
      </DialogContent>
    </Dialog>
  );
}
