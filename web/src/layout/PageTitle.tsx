import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { t } from "@/lib/i18n";

interface Props {
  initialTitle: string;
  onChange: (title: string) => void;
  /** Enter não quebra linha no título: leva o cursor para o texto da página. */
  onEnter: () => void;
  readOnly?: boolean;
}

/**
 * Título da página como campo de várias linhas que cresce com o texto, para títulos longos
 * ("Como emitir a segunda via do boleto…") não serem cortados.
 */
export function PageTitle({ initialTitle, onChange, onEnter, readOnly }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const resize = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    // scrollHeight não conta a borda de baixo (o traço de foco); com border-box ela precisa entrar na altura.
    el.style.height = `${el.scrollHeight + el.offsetHeight - el.clientHeight}px`;
  }, []);
  useLayoutEffect(resize, [resize]);
  // A fonte do título chega depois do primeiro desenho e a largura muda (barra lateral, janela): sem remedir, a última linha fica cortada.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    void document.fonts?.ready.then(resize);
    if (typeof ResizeObserver === "undefined") return;
    let width = el.offsetWidth;
    const observer = new ResizeObserver(() => {
      if (el.offsetWidth === width) return;
      width = el.offsetWidth;
      resize();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [resize]);

  return (
    <textarea
      name="title"
      ref={ref}
      rows={1}
      readOnly={readOnly}
      aria-label={t("Título da página")}
      defaultValue={initialTitle}
      placeholder={t("Sem título")}
      // biome-ignore lint/a11y/noAutofocus: página recém-criada abre com o cursor no título, que é o próximo passo de quem criou
      autoFocus={initialTitle === ""}
      onChange={(e) => {
        // Colar um título com quebras de linha vira uma linha só.
        const title = e.target.value.replace(/\s*\n\s*/g, " ");
        if (title !== e.target.value) e.target.value = title;
        resize();
        onChange(title);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onEnter();
        }
      }}
      className="block w-full resize-none overflow-hidden border-b-2 border-transparent bg-transparent pb-1 font-display text-[2.125rem] leading-tight font-extrabold tracking-tight text-balance [font-stretch:105%] outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:bg-accent"
    />
  );
}
