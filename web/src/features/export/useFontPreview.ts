import { useEffect, useState } from "react";
import { api, type FontInfo } from "@/lib/api";

/** Prefixo do nome das fontes de prévia: não mexe nas fontes do próprio Studio. */
export const previewFamily = (family: string) => `"Explicaí prévia ${family}"`;

/** Carrega as fontes do manual no navegador (quando `enabled`) para cada nome aparecer na própria fonte. */
export function useFontPreview(enabled: boolean): FontInfo[] {
  const [fonts, setFonts] = useState<FontInfo[]>([]);
  useEffect(() => {
    if (!enabled || fonts.length) return;
    let alive = true;
    void api
      .listFonts()
      .then((list) => {
        if (!alive) return;
        setFonts(list);
        for (const f of list) {
          for (const x of f.files) {
            const face = new FontFace(`Explicaí prévia ${f.family}`, `url(/api/fonts/${x.file})`, {
              weight: x.weight,
              style: x.style,
            });
            void face.load().then(
              (loaded) => document.fonts.add(loaded),
              () => undefined,
            );
          }
        }
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [enabled, fonts.length]);
  return fonts;
}
