import { type ReactNode, useEffect, useRef } from "react";
import { Brand } from "@/components/Brand";
import { Button } from "@/components/ui/button";
import { CopyCode } from "@/features/errors/CopyCode";
import { plainTitle, splitHighlight } from "@/lib/errorPages";

interface Action {
  label: string;
  onClick: () => void;
}

interface Props {
  /** O trecho entre asteriscos leva o marca-texto. */
  title: string;
  /** O que fazer, em uma frase. */
  children: ReactNode;
  action: Action;
  secondary?: Action;
  /** Código técnico, discreto e copiável. */
  technical: string;
  /** Estado que muda sozinho (reconexão), anunciado como status. */
  status?: ReactNode;
  /** Página inteira, com a marca no topo. Falso quando a barra lateral já mostra a marca. */
  standalone?: boolean;
}

/** Composição das páginas de erro: marca, título curto com marca-texto, uma ação principal, código copiável. */
export function ErrorPage({ title, children, action, secondary, technical, status, standalone = true }: Props) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus();
    if (!standalone) return;
    const before = document.title;
    document.title = `${plainTitle(title)} · Explicaí Studio`;
    return () => {
      document.title = before;
    };
  }, [standalone, title]);

  return (
    <div className="flex min-h-full flex-col bg-background">
      {standalone && (
        <header className="mx-auto w-full max-w-5xl px-5 py-5 sm:px-9">
          <Brand />
        </header>
      )}
      <div role="alert" className="mx-auto my-auto grid w-full max-w-5xl px-6 py-12 sm:px-10 [@media(max-height:600px)]:py-6">
        <div className="grid max-w-2xl justify-items-start gap-5">
          <h1
            ref={heading}
            tabIndex={-1}
            className="font-display text-4xl leading-[1.08] font-extrabold tracking-tight [font-stretch:108%] text-balance outline-none sm:text-5xl"
          >
            {splitHighlight(title).map((part) =>
              part.mark ? (
                <mark
                  key={part.text}
                  className="-mx-1 rounded-[2px] bg-marca-faixa px-1 text-inherit [box-decoration-break:clone]"
                >
                  {part.text}
                </mark>
              ) : (
                part.text
              ),
            )}
          </h1>
          <p className="max-w-prose text-lg text-pretty text-muted-foreground">{children}</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1">
            <Button size="lg" className="[@media(pointer:coarse)]:min-h-11" onClick={action.onClick}>
              {action.label}
            </Button>
            {secondary && (
              <button
                type="button"
                onClick={secondary.onClick}
                className="[@media(pointer:coarse)]:min-h-11 rounded-md px-1 font-bold text-primary underline-offset-4 hover:underline"
              >
                {secondary.label}
              </button>
            )}
          </div>
          {status && (
            <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
              <span aria-hidden className="size-2 shrink-0 rounded-full bg-primary motion-safe:animate-pulse" />
              {status}
            </p>
          )}
          <CopyCode code={technical} />
        </div>
      </div>
    </div>
  );
}
