import { createContext, type ReactNode, use } from "react";
import { type Studio, useStudio } from "./useStudio";

const StudioContext = createContext<Studio | null>(null);

/** Um estado do Studio para a tela toda: barra lateral e página leem daqui, sem passar de prop em prop. */
export function StudioProvider({ children }: { children: ReactNode }) {
  return <StudioContext value={useStudio()}>{children}</StudioContext>;
}

export function useStudioContext(): Studio {
  const studio = use(StudioContext);
  if (!studio) throw new Error("useStudioContext precisa estar dentro de <StudioProvider>.");
  return studio;
}
