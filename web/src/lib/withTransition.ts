type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => Promise<void>) => { updateCallbackDone: Promise<void> };
};

/**
 * Roda `update` dentro de uma transição de visualização quando o navegador tem a API e a pessoa
 * não pediu menos movimento. Sem a API (ou com reduced-motion), roda direto.
 */
export function withTransition<T>(update: () => Promise<T>): Promise<T> {
  const doc = document as ViewTransitionDocument;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!doc.startViewTransition || reduce) return update();

  let result: T | undefined;
  const transition = doc.startViewTransition(async () => {
    result = await update();
  });
  // ready/finished rejeitam junto com o update; o erro segue por updateCallbackDone.
  transition.ready?.catch(() => {});
  transition.finished?.catch(() => {});
  // O callback assíncrono espera o update; a promessa devolve o mesmo valor ou o mesmo erro.
  return transition.updateCallbackDone.then(() => result as T);
}
