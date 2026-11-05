import { Check, ChevronsUpDown, ListChecks, Pencil, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ManualSummary } from "@/lib/api";
import { t } from "@/lib/i18n";

/** O diálogo de renomear devolve o foco a este botão ao fechar. */
export const MANUAL_SWITCHER_ID = "manual-switcher";

interface Props {
  manuals: ManualSummary[];
  current: ManualSummary | null;
  onOpen: (slug: string) => void;
  onCreate: () => void;
  onRename: () => void;
  onCheck: () => void;
}

/** Troca de manual e atalho para criar um novo. O nome do manual aberto fica sempre à vista. */
export function ManualSwitcher({ manuals, current, onOpen, onCreate, onRename, onCheck }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          id={MANUAL_SWITCHER_ID}
          className="group -mx-1 flex w-[calc(100%+0.5rem)] flex-col items-start gap-0.5 rounded-md px-1 py-1 text-left outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-muted"
        >
          <span className="rotulo text-muted-foreground">{t("Manual")}</span>
          <span className="flex w-full items-center gap-2">
            <span className="line-clamp-2 min-w-0 flex-1 break-words font-display text-lg font-semibold leading-tight [font-stretch:105%]">
              {current?.title ?? t("Escolha um manual")}
            </span>
            <ChevronsUpDown
              className="size-4 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 group-data-[state=open]:opacity-100 [@media(hover:none)]:opacity-100"
              aria-hidden
            />
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-max min-w-(--radix-dropdown-menu-trigger-width) max-w-[min(24rem,calc(100vw-2rem))]"
      >
        <DropdownMenuLabel className="text-muted-foreground">{t("Manuais nesta pasta")}</DropdownMenuLabel>
        {manuals.map((m) => (
          <DropdownMenuItem key={m.slug} onSelect={() => onOpen(m.slug)}>
            <span className="line-clamp-2 min-w-0 flex-1 break-words">{m.title}</span>
            {m.slug === current?.slug && <Check className="text-primary" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onCreate}>
          <Plus /> {t("Novo manual")}
        </DropdownMenuItem>
        {current && (
          <DropdownMenuItem onSelect={onRename}>
            <Pencil /> {t("Renomear manual")}
          </DropdownMenuItem>
        )}
        {current && (
          <DropdownMenuItem onSelect={onCheck}>
            <ListChecks /> {t("Checar manual")}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
