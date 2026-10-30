import { useEffect, useState } from "react";
import { api, type FontInfo } from "@/lib/api";
import { previewFamily } from "@/lib/manualFont";

let loading: Promise<FontInfo[]> | null = null;

/** Busca a lista e registra as fontes no navegador uma vez só, mesmo com vários componentes pedindo. */
function loadFonts(): Promise<FontInfo[]> {
  loading ??= api
    .listFonts()
    .then((list) => {
      for (const f of list) {
        for (const x of f.files) {
          const face = new FontFace(previewFamily(f.family).slice(1, -1), `url(/api/fonts/${x.file})`, {
            weight: x.weight,
            style: x.style,
          });
          void face.load().then(
            (loaded) => document.fonts.add(loaded),
            () => undefined,
          );
        }
      }
      return list;
    })
    .catch(() => {
      loading = null; // tenta de novo na próxima vez
      return [];
    });
  return loading;
}

/** Carrega as fontes do manual no navegador (quando `enabled`) para cada nome aparecer na própria fonte. */
export function useFontPreview(enabled: boolean): FontInfo[] {
  const [fonts, setFonts] = useState<FontInfo[]>([]);
  useEffect(() => {
    if (!enabled || fonts.length) return;
    let alive = true;
    void loadFonts().then((list) => alive && setFonts(list));
    return () => {
      alive = false;
    };
  }, [enabled, fonts.length]);
  return fonts;
}
