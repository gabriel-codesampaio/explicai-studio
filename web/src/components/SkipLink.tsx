import { t } from "@/lib/i18n";

/** Primeiro foco do teclado: leva direto ao `main#conteudo`. Some até receber foco. */
export function SkipLink() {
  return (
    // biome-ignore lint/a11y/useValidAnchor: é link de pular; o clique é interceptado para não trocar o hash da rota.
    <a
      href="#conteudo"
      onClick={(e) => {
        // O endereço do Studio é o hash; um href cru trocaria a rota.
        e.preventDefault();
        document.getElementById("conteudo")?.focus();
      }}
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:font-bold focus:text-primary-foreground"
    >
      {t("Pular para o conteúdo")}
    </a>
  );
}
