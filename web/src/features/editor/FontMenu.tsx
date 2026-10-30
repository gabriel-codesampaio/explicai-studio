import { Check, ChevronDown, Type } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useFontPreview } from "@/features/export/useFontPreview";
import { useStudioContext } from "@/hooks/StudioContext";
import { t } from "@/lib/i18n";
import { previewFamily } from "@/lib/manualFont";

/** Fonte da marca para o texto, usada quando o manual não escolhe outra (o mesmo valor do diálogo Exportar). */
const DEFAULT_TEXT = "atkinson-hyperlegible-next";

/** Seletor "Fonte ▾" da barra: a fonte do texto do manual inteiro (`theme.fonts.text`), a mesma do diálogo Exportar. */
export function FontMenu() {
  const studio = useStudioContext();
  const fonts = useFontPreview(true).filter((f) => f.italic);
  const currentId = studio.manual?.theme.fonts?.text ?? DEFAULT_TEXT;
  const current = fonts.find((f) => f.id === currentId);
  if (!current) return null;
  const pick = (id: string) =>
    void studio.setManualTheme({ fonts: { text: id === DEFAULT_TEXT ? null : id } }).catch(() => undefined);

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              data-roving
              tabIndex={-1}
              aria-label={t("Fonte do manual: {fonte}", { fonte: current.family })}
              onMouseDown={(e) => e.preventDefault()}
              className="inline-flex h-8 w-40 shrink-0 items-center gap-2 rounded-md px-2.5 text-sm [@media(pointer:coarse)]:h-11 hover:bg-secondary data-[state=open]:bg-secondary"
            >
              <Type className="size-4 shrink-0 text-primary" aria-hidden />
              <span className="flex-1 truncate text-left">{current.family}</span>
              <ChevronDown className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            </button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>{t("Fonte do manual inteiro")}</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="start" className="w-56" onCloseAutoFocus={(e) => e.preventDefault()}>
        {fonts.map((f) => (
          <DropdownMenuItem
            key={f.id}
            onSelect={() => pick(f.id)}
            style={{ fontFamily: `${previewFamily(f.family)}, ${f.kind === "serif" ? "serif" : "sans-serif"}` }}
          >
            <span className="flex-1">{f.family}</span>
            {f.id === currentId && <Check className="size-4 text-primary" aria-hidden />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
