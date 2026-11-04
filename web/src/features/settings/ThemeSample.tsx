import { useEffect, useState } from "react";
import { api, type FontInfo, type ManualTheme } from "@/lib/api";
import { t } from "@/lib/i18n";
import { previewFamily } from "@/lib/manualFont";
import { DEFAULT_FONTS } from "./FontFields";
import { useFontPreview } from "./useFontPreview";

const stack = (f: FontInfo | undefined, fallback: string) => (f ? `${previewFamily(f.family)}, ${fallback}` : fallback);

/**
 * Amostra do manual com as cores e fontes escolhidas. As variáveis vêm do `themeCss` do export (rota do servidor);
 * os valores de `var(--x, padrão)` são só os da marca, para o que o manual ainda não mudou.
 */
export function ThemeSample({ slug, theme }: { slug: string; theme: ManualTheme }) {
  const fonts = useFontPreview(true);
  const [css, setCss] = useState("");
  const key = JSON.stringify(theme);
  // biome-ignore lint/correctness/useExhaustiveDependencies: `key` refaz a busca quando o tema muda.
  useEffect(() => {
    let alive = true;
    void api.themeCss(slug).then(
      (r) => alive && setCss(r.css),
      () => undefined,
    );
    return () => {
      alive = false;
    };
  }, [slug, key]);

  // O CSS do servidor cita a família real; a prévia registra as fontes com outro nome (não mexe nas do Studio).
  const styled = fonts.reduce((acc, f) => acc.replaceAll(`"${f.family}"`, previewFamily(f.family)), css);
  const byId = (id: string) => fonts.find((f) => f.id === id);
  const body = stack(byId(DEFAULT_FONTS.text), "sans-serif");
  const display = stack(byId(DEFAULT_FONTS.headings), "sans-serif");
  const mono = "ui-monospace, Consolas, monospace";

  return (
    <section className="grid content-start gap-3" aria-labelledby="aparencia-amostra">
      <h3 id="aparencia-amostra" className="rotulo">
        {t("Amostra")}
      </h3>
      <style>{styled}</style>
      <div
        className="amostra-manual grid gap-2 rounded-lg border border-border bg-white p-5 text-[15px] leading-relaxed"
        style={{ color: "var(--tinta, #151a33)", fontFamily: `var(--texto, ${body})` }}
        data-testid="amostra-manual"
      >
        <h4
          className="m-0 text-3xl font-extrabold leading-tight"
          style={{ color: "var(--t-page, #000)", fontFamily: `var(--display, ${display})` }}
        >
          {t("Um título de página")}
        </h4>
        <h5
          className="m-0 mt-2 text-xl font-bold"
          style={{ color: "var(--t-h1, #000)", fontFamily: `var(--display, ${display})` }}
        >
          {t("Título {n}", { n: 1 })}
        </h5>
        <h6 className="m-0 text-base font-bold" style={{ color: "var(--t-h2, #000)", fontFamily: `var(--display, ${display})` }}>
          {t("Título {n}", { n: 2 })}
        </h6>
        <p className="m-0">{t("O texto corrido usa a fonte e a cor escolhidas.")}</p>
        <p className="m-0">
          <span style={{ color: "var(--accent, #2b4fe0)", textDecoration: "underline", textUnderlineOffset: ".2em" }}>
            {t("Um link para outra página")}
          </span>
        </p>
        <p className="m-0">
          <mark style={{ background: "var(--marca-faixa, rgba(255,212,59,.55))", color: "inherit" }}>
            {t("Um trecho com realce")}
          </mark>
        </p>
        <p
          className="m-0 border-l-4 py-1.5 pl-3"
          style={{ borderColor: "var(--accent, #2b4fe0)", background: "var(--anotacao-fundo, rgba(43,79,224,.08))" }}
        >
          {t("Resultado: a tela abre sem erro.")}
        </p>
        <div className="flex items-center gap-3">
          <span
            className="grid size-6 place-items-center rounded-full text-xs font-bold text-white"
            style={{ background: "var(--accent, #2b4fe0)", fontFamily: mono }}
            aria-hidden
          >
            1
          </span>
          <span>{t("Abra o menu Ajustes")}</span>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="grid size-6 place-items-center rounded-full text-xs font-bold text-white"
            style={{ background: "var(--anotacao, #2b4fe0)", outline: "2px solid var(--marca, #ffd43b)", outlineOffset: 2 }}
            aria-hidden
          >
            2
          </span>
          <span>{t("Marcador no print")}</span>
        </div>
      </div>
    </section>
  );
}
