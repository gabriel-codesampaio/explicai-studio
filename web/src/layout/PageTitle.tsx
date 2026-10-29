import { useLayoutEffect, useRef } from "react";
import { t } from "@/lib/i18n";

interface Props {
  initialTitle: string;
  onChange: (title: string) => void;
  /** Enter não quebra linha no título: leva o cursor para o texto da página. */
  onEnter: () => void;
}

/**
 * Título da página como campo de várias linhas que cresce com o texto, para títulos longos
 * ("Como emitir a segunda via do boleto…") não serem cortados.
 */
export function PageTitle({ initialTitle, onChange, onEnter }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const resize = () => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    // scrollHeight não conta a borda de baixo (o traço de foco); com border-box ela precisa entrar na altura.
    el.style.height = `${el.scrollHeight + el.offsetHeight - el.clientHeight}px`;
  };
  useLayoutEffect(resize, []);

  return (
    <textarea
      name="title"
      ref={ref}
      rows={1}
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
      className="block w-full resize-none overflow-hidden border-b-2 border-transparent bg-transparent pb-1 font-display text-[2.125rem] leading-tight font-extrabold tracking-tight text-balance [font-stretch:105%] outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-marca"
    />
  );
}
