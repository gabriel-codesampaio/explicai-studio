import { useStudioContext } from "@/hooks/StudioContext";
import { errorMessage, type ManualTheme, type ThemePatch } from "@/lib/api";
import { t } from "@/lib/i18n";
import { FontPicker } from "./FontPicker";
import { useFontPreview } from "./useFontPreview";

/** As fontes da marca, usadas quando o manual não escolhe outra. */
const DEFAULT_FONTS = { text: "atkinson-hyperlegible-next", headings: "archivo" };

/** Fontes do texto e dos títulos do manual. A do texto também vale ao vivo no editor. Cada campo salva sozinho. */
export function FontFields({ theme }: { theme: ManualTheme }) {
  const studio = useStudioContext();
  const fonts = useFontPreview(true);
  const saveFont = (patch: ThemePatch) =>
    void studio.setManualTheme(patch).catch((err: unknown) => studio.reportError(errorMessage(err)));
  if (fonts.length === 0) return null;

  return (
    <section className="grid gap-3" aria-labelledby="aparencia-fontes">
      <h3 id="aparencia-fontes" className="rotulo">
        {t("Fontes do manual")}
      </h3>
      <FontPicker
        label={t("Fonte do texto")}
        fonts={fonts.filter((f) => f.italic)}
        value={theme.fonts?.text}
        fallback={DEFAULT_FONTS.text}
        onChange={(id) => saveFont({ fonts: { text: id } })}
      />
      <FontPicker
        label={t("Fonte dos títulos")}
        fonts={fonts}
        value={theme.fonts?.headings}
        fallback={DEFAULT_FONTS.headings}
        onChange={(id) => saveFont({ fonts: { headings: id } })}
      />
    </section>
  );
}
