/**
 * Erro do núcleo que a interface sabe traduzir: a mensagem fica em português (CLI e MCP leem ela),
 * e `code` + `params` são estáveis para o Studio montar o texto no idioma escolhido.
 */
export class ExplicaiError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly params: Record<string, string | number> = {},
  ) {
    super(message);
  }
}
