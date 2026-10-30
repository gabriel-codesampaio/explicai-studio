import { useState } from "react";
import { useStudioContext } from "@/hooks/StudioContext";
import type { ManualTheme, ThemePatch } from "@/lib/api";
import { t } from "@/lib/i18n";
import { ColorField } from "./ColorField";
import { FontPicker } from "./FontPicker";
import { useFontPreview } from "./useFontPreview";

/** Atalhos de cor de destaque. A primeira é a da marca. */
const ACCENTS = [
  { label: t("Cobalto"), swatch: "#2b4fe0" },
  { label: t("Esmeralda"), swatch: "#0f7a55" },
  { label: t("Ameixa"), swatch: "#7a3fc4" },
  { label: t("Grafite"), swatch: "#3d4459" },
] as const;

const DEFAULTS = { text: "#151a33", accent: ACCENTS[0].swatch, highlight: "#ffd43b", heading: "#000000" };

/** As fontes da marca, usadas quando o manual não escolhe outra. */
const DEFAULT_FONTS = { text: "atkinson-hyperlegible-next", headings: "archivo" };

const HEADINGS = [
  { slot: "cover", label: t("Título da capa") },
  { slot: "page", label: t("Título da página") },
  { slot: "h1", label: t("Título 1") },
  { slot: "h2", label: t("Título 2") },
  { slot: "h3", label: t("Título 3") },
] as const;

/** Cores do manual exportado (o Studio fica sempre no cobalto). Cada campo salva sozinho. */
export function ThemeFields({ theme }: { theme: ManualTheme }) {
  const studio = useStudioContext();
  const [open, setOpen] = useState(false);
  const fonts = useFontPreview(open);
  const save = (patch: ThemePatch) => studio.setManualTheme(patch);
  const saveFont = (patch: ThemePatch) => void save(patch).catch(() => undefined);

  return (
    <details className="group" onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary className="cursor-pointer rotulo hover:text-foreground">{t("Cores do manual")}</summary>
      <div className="mt-3 grid gap-2.5">
        <ColorField
          label={t("Cor do texto")}
          value={theme.text}
          fallback={DEFAULTS.text}
          onCommit={(hex) => save({ text: hex })}
        />
        <div className="grid gap-1.5">
          <ColorField
            label={t("Cor de destaque")}
            value={theme.accent}
            fallback={DEFAULTS.accent}
            onCommit={(hex) => save({ accent: hex })}
          />
          <div className="flex flex-wrap gap-1.5 pl-9">
            {ACCENTS.map((a) => (
              <button
                key={a.swatch}
                type="button"
                aria-pressed={(theme.accent ?? DEFAULTS.accent) === a.swatch}
                onClick={() => void save({ accent: a.swatch === DEFAULTS.accent ? null : a.swatch }).catch(() => undefined)}
                className="flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-xs hover:bg-muted aria-pressed:border-primary aria-pressed:bg-accent aria-pressed:font-bold"
              >
                <span className="size-3.5 rounded-full ring-1 ring-foreground/20" style={{ background: a.swatch }} aria-hidden />
                {a.label}
              </button>
            ))}
          </div>
          <p className="pl-9 text-xs text-muted-foreground">{t("Links, números dos passos e marcações dos prints.")}</p>
        </div>
        <ColorField
          label={t("Cor de realce")}
          value={theme.highlight}
          fallback={DEFAULTS.highlight}
          onCommit={(hex) => save({ highlight: hex })}
        />
        <p className="-mt-1 pl-9 text-xs text-muted-foreground">{t("Capa, “Resultado:” e destaques nas imagens.")}</p>
        <div className="mt-1 grid gap-2.5">
          {HEADINGS.map(({ slot, label }) => (
            <ColorField
              key={slot}
              label={label}
              value={theme.headings?.[slot]}
              fallback={DEFAULTS.heading}
              onCommit={(hex) => save({ headings: { [slot]: hex } })}
            />
          ))}
        </div>
        {fonts.length > 0 && (
          <div className="mt-1 grid gap-3">
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
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          {t("Texto, títulos e destaque precisam de contraste de 4,5:1 com o branco para a leitura ficar nítida.")}
        </p>
      </div>
    </details>
  );
}
