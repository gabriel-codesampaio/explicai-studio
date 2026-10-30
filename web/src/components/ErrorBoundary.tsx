import { Component, type ReactNode } from "react";
import { CrashScreen } from "@/features/errors/CrashScreen";

interface Props {
  children: ReactNode;
  /** Muda quando a pessoa troca de página: a tela tenta de novo sozinha. */
  resetKey?: string;
  /** Deixa "Tentar de novo sem recarregar" de fora (falha na raiz). */
  root?: boolean;
}

interface State {
  error: Error | null;
  key?: string;
}

/** Pega erro de renderização para a tela não ficar em branco. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, key: this.props.resetKey };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  static getDerivedStateFromProps(props: Props, state: State): Partial<State> | null {
    return props.resetKey !== state.key ? { error: null, key: props.resetKey } : null;
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }) {
    console.error(error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return <CrashScreen error={error} onRetry={this.props.root ? undefined : () => this.setState({ error: null })} />;
  }
}
