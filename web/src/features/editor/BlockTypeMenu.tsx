import { type Editor, useEditorState } from "@tiptap/react";
import { ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { BLOCKS } from "./blocks";

const TEXT_TYPES = BLOCKS.filter((b) => b.isTextType);

/** Seletor "Texto ▾" da barra: mostra o tipo do bloco onde está o cursor e troca por outro. */
export function BlockTypeMenu({ editor, pickImage, className }: { editor: Editor; pickImage: () => void; className?: string }) {
  const current = useEditorState({
    editor,
    selector: ({ editor: e }) => [...TEXT_TYPES].reverse().find((b) => b.isActive?.(e))?.id ?? "paragraph",
  });
  const active = TEXT_TYPES.find((b) => b.id === current) ?? TEXT_TYPES[0];
  if (!active) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          data-roving
          tabIndex={0}
          aria-label={t("Tipo de bloco: {tipo}", { tipo: active.label })}
          onMouseDown={(e) => e.preventDefault()}
          className={cn(
            "inline-flex h-8 w-52 items-center gap-2 rounded-md px-2.5 text-sm hover:bg-secondary data-[state=open]:bg-secondary",
            className,
          )}
        >
          <active.icon className="size-4 text-primary" aria-hidden />
          <span className="flex-1 truncate text-left font-display font-bold">{active.label}</span>
          <ChevronDown className="size-4 text-muted-foreground" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56" onCloseAutoFocus={(e) => e.preventDefault()}>
        {TEXT_TYPES.map((b) => (
          <DropdownMenuItem key={b.id} onSelect={() => b.run({ editor, pickImage })}>
            <b.icon className="text-primary" /> {b.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
