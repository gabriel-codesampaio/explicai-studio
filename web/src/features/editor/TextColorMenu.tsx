import { type Editor, useEditorState } from "@tiptap/react";
import { Check } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { t } from "@/lib/i18n";
import { TEXT_COLOR_LABELS, TEXT_COLORS, type TextColorName } from "./textColor";

/**
 * Botão "A" com a cor atual sublinhada e um menu com o nome de cada cor. Usado na barra fixa (`roving`:
 * entra no vai-e-vem das setas) e na flutuante. Não rouba o foco do editor; ao escolher, o foco volta a ele.
 */
export function TextColorMenu({ editor, roving }: { editor: Editor; roving?: boolean }) {
  const color = useEditorState({
    editor,
    selector: ({ editor: e }) => (e.getAttributes("textColor").color as TextColorName | undefined) ?? null,
  });
  const paint = (name: TextColorName | null) =>
    (name ? editor.chain().focus().setTextColor(name) : editor.chain().focus().unsetTextColor()).run();
  const swatch = (name: TextColorName | null) => ({ color: name ? `var(--cor-${name})` : undefined });

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              data-roving={roving ? "" : undefined}
              tabIndex={roving ? -1 : undefined}
              aria-label={t("Cor do texto")}
              onMouseDown={(e) => e.preventDefault()}
              className="inline-flex h-8 flex-col items-center justify-center rounded-md px-2 font-display text-sm font-bold text-muted-foreground hover:bg-secondary hover:text-foreground data-[state=open]:bg-secondary"
            >
              <span aria-hidden>A</span>
              <span
                aria-hidden
                className="-mt-0.5 h-[3px] w-4 rounded-full bg-foreground"
                style={color ? { background: `var(--cor-${color})` } : undefined}
              />
            </button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>{t("Cor do texto")}</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="start" className="w-44" onCloseAutoFocus={(e) => e.preventDefault()}>
        {[null, ...TEXT_COLORS].map((name) => (
          <DropdownMenuItem key={name ?? "default"} aria-current={color === name} onSelect={() => paint(name)}>
            <span aria-hidden className="w-4 text-center font-display font-bold" style={swatch(name)}>
              A
            </span>
            {t(name ? TEXT_COLOR_LABELS[name] : "Cor padrão")}
            {color === name && <Check className="ml-auto" aria-hidden />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
