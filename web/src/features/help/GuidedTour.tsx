import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { t } from "@/lib/i18n";
import { findTarget, isTourSeen, markTourSeen, shouldAutoOpen, TOUR_EVENT, TOUR_STEPS } from "./tourSteps";

const store = (): Storage | null => {
  try {
    return localStorage;
  } catch {
    return null;
  }
};

/** Centro da janela, para o passo cujo alvo não está na tela. */
const centered = {
  getBoundingClientRect: () => DOMRect.fromRect({ x: innerWidth / 2, y: innerHeight / 2, width: 0, height: 0 }),
};

/** Passeio guiado do primeiro uso: popovers ancorados nos elementos reais. Reabre pelo evento do menu Ajustes. */
export function GuidedTour() {
  const [index, setIndex] = useState<number | null>(null);
  const titleId = useId();

  useEffect(() => {
    if (shouldAutoOpen({ seen: isTourSeen(store()), webdriver: navigator.webdriver === true, search: location.search }))
      setIndex(0);
    // setTimeout: deixa o menu fechar e devolver o foco antes de o passeio pegar o foco.
    const reopen = () => setTimeout(() => setIndex(0), 0);
    window.addEventListener(TOUR_EVENT, reopen);
    return () => window.removeEventListener(TOUR_EVENT, reopen);
  }, []);

  if (index === null) return null;
  const step = TOUR_STEPS[index];
  if (!step) return null;
  const last = index === TOUR_STEPS.length - 1;
  const close = () => {
    markTourSeen(store());
    setIndex(null);
  };

  return (
    <Popover open onOpenChange={(open) => !open && close()}>
      <PopoverAnchor virtualRef={{ current: findTarget(step) ?? centered }} />
      <PopoverContent
        aria-labelledby={titleId}
        side={findTarget(step) ? "bottom" : "top"}
        collisionPadding={12}
        className="w-80 max-w-[calc(100vw-1.5rem)] motion-reduce:animate-none motion-reduce:transition-none"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <p className="rotulo mb-1">{t("Passo {n} de {total}", { n: index + 1, total: TOUR_STEPS.length })}</p>
        <h2 id={titleId} className="font-display text-base font-bold">
          {t(step.title)}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{t(step.body)}</p>
        <div className="mt-3 flex justify-between gap-2">
          <Button type="button" variant="ghost" className="[@media(pointer:coarse)]:h-11" onClick={close}>
            {t("Pular passeio")}
          </Button>
          <Button type="button" className="[@media(pointer:coarse)]:h-11" onClick={() => (last ? close() : setIndex(index + 1))}>
            {last ? t("Concluir") : t("Próximo")}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
