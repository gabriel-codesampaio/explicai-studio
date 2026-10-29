import { Keyboard } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { t } from "@/lib/i18n";

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
    keys: [["Delete", "Excluir a marcação selecionada"]],
  },
];

/** Botão "Atalhos" da barra lateral: lista as teclas do Studio, agrupadas pelo que a pessoa está fazendo. */
export function ShortcutsDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Keyboard className="size-4" aria-hidden /> {t("Atalhos")}
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-extrabold tracking-tight">{t("Atalhos de teclado")}</DialogTitle>
          <DialogDescription>{t("No Mac, use Cmd no lugar de Ctrl.")}</DialogDescription>
        </DialogHeader>
        {GROUPS.map((group) => (
          <section key={group.title} className="grid gap-1.5">
            <h3 className="text-sm font-bold">{t(group.title)}</h3>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
              {group.keys.map(([key, what]) => (
                <div key={key} className="contents">
                  <dt>
                    <kbd className="rounded border border-border bg-card px-1.5 py-0.5 font-mono text-xs whitespace-nowrap">
                      {t(key)}
                    </kbd>
                  </dt>
                  <dd className="text-muted-foreground">{t(what)}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </DialogContent>
    </Dialog>
  );
}
