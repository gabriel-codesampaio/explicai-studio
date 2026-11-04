import { type Editor, useEditorState } from "@tiptap/react";
import { CaseSensitive, Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Kbd } from "@/components/ui/kbd";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { t } from "@/lib/i18n";
import { TEXT_FONTS, type TextFontId } from "./textFont";

export const FONT_SHORTCUT = "Ctrl+Shift+F";

/**
 * Fonte só do trecho selecionado (a do manual inteiro fica na Aparência). Menu na barra da seleção; cada item
 * aparece na própria fonte. Ctrl+Shift+F abre o menu. Não rouba o foco do editor; ao escolher, o foco volta a ele.
 */
export function FontMenu({ editor }: { editor: Editor }) {
  const font = useEditorState({
    editor,
    selector: ({ editor: e }) => (e.getAttributes("textFont").font as TextFontId | undefined) ?? null,
  });
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false); // re-renderiza ao abrir: o contêiner só existe com a barra montada
  const pick = (id: TextFontId | null) =>
    (id ? editor.chain().focus().setTextFont(id) : editor.chain().focus().unsetTextFont()).run();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "f" && editor.isFocused) {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [editor]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              ref={trigger}
              aria-label={t("Fonte do trecho")}
              onMouseDown={(e) => e.preventDefault()}
              className="inline-flex h-8 items-center rounded-md px-2 [@media(pointer:coarse)]:h-11 [@media(pointer:coarse)]:min-w-11 [@media(pointer:coarse)]:justify-center text-muted-foreground hover:bg-secondary hover:text-foreground data-[state=open]:bg-secondary"
            >
              <CaseSensitive className="size-4" aria-hidden />
            </button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>
          {t("Fonte do trecho")}
          <Kbd className="ml-2 border-background/30 bg-background/10 text-background">{FONT_SHORTCUT}</Kbd>
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent
        align="start"
        className="w-60"
        container={trigger.current?.closest<HTMLElement>("[role=toolbar]")}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {[null, ...TEXT_FONTS].map((f) => (
          <DropdownMenuItem key={f?.id ?? "default"} aria-current={font === (f?.id ?? null)} onSelect={() => pick(f?.id ?? null)}>
            <span style={f ? { fontFamily: `"Explicaí prévia ${f.label}"` } : undefined}>{f ? f.label : t("Fonte padrão")}</span>
            {font === (f?.id ?? null) && <Check className="ml-auto" aria-hidden />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
