import { NodeViewContent, type NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import { ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { t } from "@/lib/i18n";
import { CALLOUT_TYPES, type CalloutType, calloutLabel } from "./callout";
import { CALLOUT_ICONS } from "./calloutIcons";

/**
 * O alerta no editor: painel na cor do tipo, ícone, rótulo (que também troca o tipo) e o texto editável.
 * O rótulo segue o idioma do manual, como no HTML exportado.
 */
export function CalloutView({ node, editor, updateAttributes }: NodeViewProps) {
  const type = node.attrs.type as CalloutType;
  const lang = editor.view.dom.closest("[lang]")?.getAttribute("lang") ?? "pt-BR";
  const Icon = CALLOUT_ICONS[type];

  return (
    <NodeViewWrapper className="callout" data-callout={type}>
      <div className="callout-head" contentEditable={false}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="callout-type"
              aria-label={t("Tipo de alerta: {tipo}", { tipo: calloutLabel(type, lang) })}
              onMouseDown={(e) => e.preventDefault()}
            >
              <Icon aria-hidden />
              <span>{calloutLabel(type, lang)}</span>
              <ChevronDown aria-hidden />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" onCloseAutoFocus={(e) => e.preventDefault()}>
            {CALLOUT_TYPES.map((tp) => {
              const Ic = CALLOUT_ICONS[tp];
              return (
                <DropdownMenuItem key={tp} onSelect={() => updateAttributes({ type: tp })}>
                  <Ic aria-hidden style={{ color: `var(--aviso-${tp})` }} /> {calloutLabel(tp, lang)}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <NodeViewContent className="callout-body" />
    </NodeViewWrapper>
  );
}
