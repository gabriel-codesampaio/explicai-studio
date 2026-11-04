import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { t } from "@/lib/i18n";
import { FIRST_STEP } from "./firstStep";

/** Mude aqui quando um atalho novo entrar no Studio: esta lista é a única ajuda de teclado. */
const GROUPS: { title: string; keys: [string, string][] }[] = [
  {
    title: "Escrevendo",
    keys: [
      ["/", "Inserir bloco: título, passos, imagem, tabela…"],
      ["Ctrl+B", "Negrito"],
      ["Ctrl+I", "Itálico"],
      ["Ctrl+E", "Código no texto"],
      ["Ctrl+K", "Link para outra página ou endereço"],
      ["Ctrl+Z", "Desfazer"],
      ["Enter no título", "Ir para o texto da página"],
    ],
  },
  {
    title: "Páginas",
    keys: [
      ["Ctrl+P", "Buscar página pelo título"],
      ["Ctrl+\\", "Mostrar ou esconder as páginas"],
      ["↑ ↓", "Andar entre as páginas da árvore"],
      ["Alt+Shift+↑ ↓", "Mover a página para cima ou para baixo"],
      ["Alt+Shift+→ ←", "Virar subpágina ou subir um nível"],
      ["Shift+F10", "Abrir o menu da página"],
    ],
  },
  {
    title: "Marcando imagens",
    keys: [
      ["V", "Ferramenta Selecionar"],
      ["M", "Ferramenta Marcador"],
      ["D", "Ferramenta Destaque"],
      ["S", "Ferramenta Seta"],
      ["A", "Ferramenta Área clicável"],
      ["O", "Ferramenta Ocultar"],
      ["R", "Ferramenta Recortar"],
      ["Delete", "Excluir a marcação selecionada"],
    ],
  },
];

const SPELLCHECK_HELP =
  "O corretor é o do navegador e segue o idioma do manual. Para ensinar uma palavra, clique nela com o botão direito, sublinhada em vermelho, e escolha Adicionar ao dicionário.";

/** Painel "Atalhos" (aberto pelo menu "⋯" da barra lateral): lista as teclas do Studio, agrupadas pelo que a pessoa está fazendo. */
export function ShortcutsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-extrabold tracking-tight">{t("Atalhos de teclado")}</DialogTitle>
          <DialogDescription>{t("No Mac, use Cmd no lugar de Ctrl.")}</DialogDescription>
        </DialogHeader>
        {GROUPS.map((group) => (
          <section key={group.title} className="grid gap-1.5">
            <h3 className="rotulo">{t(group.title)}</h3>
            <dl className="grid grid-cols-[9.5rem_1fr] gap-x-4 gap-y-1.5 text-sm">
              {group.keys.map(([key, what]) => (
                <div key={key} className="contents">
                  <dt>
                    <kbd className="rounded-sm border border-border bg-card px-1.5 py-0.5 font-mono text-xs whitespace-nowrap">
                      {t(key)}
                    </kbd>
                  </dt>
                  <dd className="text-muted-foreground">{t(what)}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
        <section className="grid gap-1.5">
          <h3 className="rotulo">{t(FIRST_STEP.title)}</h3>
          <ol className="list-decimal pl-5 text-sm text-muted-foreground">
            {FIRST_STEP.steps.map((step) => (
              <li key={step}>{t(step)}</li>
            ))}
          </ol>
          <p className="text-sm text-muted-foreground">
            {t(FIRST_STEP.exportLine)} {t("Use o botão Exportar manual, no topo da página.")}
          </p>
        </section>
        <section className="grid gap-1.5">
          <h3 className="rotulo">{t("Corretor ortográfico")}</h3>
          <p className="text-sm text-muted-foreground">{t(SPELLCHECK_HELP)}</p>
        </section>
      </DialogContent>
    </Dialog>
  );
}
