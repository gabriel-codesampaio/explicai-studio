import "@fontsource-variable/archivo/wdth.css";
import "@fontsource/atkinson-hyperlegible-next/400.css";
import "@fontsource/atkinson-hyperlegible-next/700.css";
import "@fontsource-variable/jetbrains-mono";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { locale } from "./lib/i18n";
import { followSystemTheme } from "./lib/theme";
import "./styles/index.css";

const root = document.getElementById("root");
if (!root) throw new Error("index.html sem o elemento #root.");

// O index.html nasce em pt-BR; o leitor de tela precisa saber o idioma escolhido.
document.documentElement.lang = locale;
followSystemTheme();
createRoot(root).render(
  <StrictMode>
    <ErrorBoundary root>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
