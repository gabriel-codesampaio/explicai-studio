import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useStudioContext } from "@/hooks/StudioContext";
import { errorMessage } from "@/lib/api";
import { t } from "@/lib/i18n";
import { CoverFooterFields } from "./CoverFooterFields";
import { FontFields } from "./FontFields";
import { LogoField } from "./LogoField";
import { ThemeFields } from "./ThemeFields";

/** Diálogo "Aparência do manual" (Ajustes): cores, fontes, logo e rodapé do HTML e do PDF. Cada campo salva sozinho. */
export function ManualAppearanceDialog({
  open,
  onOpenChange,
  section,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Seção em que o diálogo abre: o foco vai ao primeiro campo dela. */
  section?: "cover";
}) {
  const studio = useStudioContext();
  const manual = studio.manual;
  if (!manual) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        // Sair do campo salva o que foi digitado; fechar com Esc remove o campo sem blur.
        if (!next && document.activeElement instanceof HTMLElement) document.activeElement.blur();
        onOpenChange(next);
      }}
    >
      <DialogContent
        className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"
        onOpenAutoFocus={(e) => {
          const first = section === "cover" ? document.querySelector<HTMLElement>("#aparencia-capa input") : null;
          if (!first) return;
          e.preventDefault();
          first.focus();
        }}
      >
        <div className="px-6 pt-6 pr-12 pb-4">
          <DialogTitle className="font-display text-xl font-extrabold tracking-tight">{t("Aparência do manual")}</DialogTitle>
          <DialogDescription>
            {t("Vale para o HTML, o PDF e o texto do editor. O tema do Studio fica à parte.")}
          </DialogDescription>
        </div>
        <div className="grid min-h-0 flex-1 gap-6 overflow-y-auto px-6 pb-6">
          <ThemeFields theme={manual.theme} />
          <FontFields theme={manual.theme} />
          <section className="grid gap-3" aria-labelledby="aparencia-logo">
            <h3 id="aparencia-logo" className="rotulo">
              {t("Logo")}
            </h3>
            <LogoField slug={manual.slug} logo={manual.theme.logo} />
          </section>
          <CoverFooterFields />
          <section className="grid gap-3" aria-labelledby="aparencia-rodape">
            <h3 id="aparencia-rodape" className="rotulo">
              {t("Rodapé do Explicaí")}
            </h3>
            <label className="flex items-start gap-2.5 text-sm">
              <input
                type="checkbox"
                checked={manual.theme.hideColophon === true}
                onChange={(e) =>
                  void studio
                    .setManualTheme({ hideColophon: e.target.checked ? true : null })
                    .catch((err: unknown) => studio.reportError(errorMessage(err)))
                }
                className="mt-0.5 size-4 accent-[var(--primary)]"
              />
              <span className="grid leading-tight">
                <span className="font-bold">{t("Sem o rodapé do Explicaí")}</span>
                <span className="text-xs text-muted-foreground">
                  {t('Tira a linha "Manual feito com o Explicaí Studio" do HTML e do PDF.')}
                </span>
              </span>
            </label>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
