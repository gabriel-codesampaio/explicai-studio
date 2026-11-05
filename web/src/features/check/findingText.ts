import type { CheckKind } from "@/lib/api";
import { t } from "@/lib/i18n";

/** Nome do tipo de achado na língua da interface. */
export function kindLabel(kind: CheckKind): string {
  switch (kind) {
    case "no-image":
      return t("Página com passos e sem print");
    case "step-without-result":
      return t("Passo sem resultado");
    case "dead-link":
      return t("Link para página que não existe");
    case "missing-image":
      return t("Imagem não encontrada");
    case "hotspot-missing-page":
      return t("Área clicável aponta para página apagada");
    case "image-without-markers":
      return t("Imagem sem marcação");
    case "marker-without-label":
      return t("Marcador sem descrição");
    case "to-confirm":
      return t("A confirmar");
    case "not-reviewed":
      return t("Página sem conferência");
    default:
      return String(kind);
  }
}

/** Como resolver, em uma frase para quem escreve o manual. Tipo desconhecido: sem dica. */
export function kindFix(kind: CheckKind): string {
  switch (kind) {
    case "no-image":
      return t("Cole um print que mostre o passo, ou tire os passos se não precisar deles.");
    case "step-without-result":
      return t('Acrescente uma linha "Resultado:" dizendo o que a pessoa vê depois do passo.');
    case "dead-link":
      return t("Troque o link por uma página que existe, ou tire o link.");
    case "missing-image":
      return t("Envie a imagem de novo ou troque por outra.");
    case "hotspot-missing-page":
      return t("Escolha outra página de destino para a área clicável, ou tire a área.");
    case "image-without-markers":
      return t("Marque na imagem o que a pessoa deve olhar.");
    case "marker-without-label":
      return t("Escreva uma descrição para cada marcador.");
    case "to-confirm":
      return t('Confirme a informação e tire o "A confirmar".');
    case "not-reviewed":
      return t("Leia a página e marque como conferida.");
    default:
      return "";
  }
}

// O `detail` do núcleo vem em português. Aqui sai só a parte variável (passo, arquivo, link), para o texto ao redor seguir o idioma da interface.
const VARIABLE: Partial<Record<CheckKind, RegExp>> = {
  "step-without-result": /^Passo sem "Resultado:": (.*)$/s,
  "dead-link": /^Link para página que não existe: (.*)$/s,
  "missing-image": /^Imagem não encontrada: (.*)$/s,
  "image-without-markers": /^Imagem sem marcação: (.*)$/s,
  "marker-without-label": /^Marcador sem descrição em (.+?): (.*)$/s,
  "not-reviewed": /^Sem conferência há mais de \d+ dias \((.*)\)\.$/s,
  "hotspot-missing-page": /^Hotspot de (.+?) aponta para página apagada \((.*)\)\.$/s,
};

/** Detalhe do achado na língua da interface. Formato inesperado: devolve o texto do núcleo. */
export function findingDetail(kind: CheckKind, detail: string): string {
  const m = VARIABLE[kind]?.exec(detail);
  const [a = "", b = ""] = m ? m.slice(1) : [];
  switch (kind) {
    case "no-image":
      return t("A página tem passos e nenhum print.");
    case "to-confirm":
      return t('A página ainda tem o marcador "A confirmar".');
    case "not-reviewed":
      return m ? t("Última conferência em {data}, há mais de 90 dias.", { data: a }) : t("A página nunca foi conferida.");
    case "step-without-result":
      return m ? t("Passo: {passo}", { passo: a }) : detail;
    case "dead-link":
      return m ? t("Destino: {destino}", { destino: a }) : detail;
    case "missing-image":
    case "image-without-markers":
      return m ? t("Arquivo: {arquivo}", { arquivo: a }) : detail;
    case "marker-without-label":
      return m ? t("Arquivo {arquivo}, marcadores {numeros}", { arquivo: a, numeros: b }) : detail;
    case "hotspot-missing-page":
      return m ? t("Arquivo {arquivo}, página de destino {id}", { arquivo: a, id: b }) : detail;
    default:
      return (kind as string) === "not-reviewed" ? t("Ninguém conferiu esta página ainda.") : detail;
  }
}
