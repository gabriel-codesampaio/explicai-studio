import { Lexer, type Token, type Tokens } from "marked";

/** "Resultado:" no começo de uma linha ou depois de uma frase, com ou sem negrito. */
const MARK = /(?:^|\n|(?<=[.!?:;)] ))[ \t]*(?:\*\*Resultado:\*\*|\*\*Resultado\*\*:|Resultado:)[ \t]*/i;

/**
 * "Resultado:" dentro de um passo vira citação (`li>blockquote`), o formato que o CSS do export destaca.
 * Vale para manual escrito à mão ou antigo; o texto do arquivo não muda. Só o primeiro por passo.
 */
export function liftResult(item: Tokens.ListItem): void {
  for (const [i, tok] of item.tokens.entries()) {
    if (tok.type !== "text" && tok.type !== "paragraph") continue;
    const { text } = tok as Tokens.Text;
    const m = MARK.exec(text);
    if (!m) continue;
    const rest = text.slice(m.index + m[0].length).trim();
    if (!rest) return;
    const before = text.slice(0, m.index).trimEnd();
    const body = `**Resultado:** ${rest}`;
    const quote: Tokens.Blockquote = {
      type: "blockquote",
      raw: `> ${body}`,
      text: body,
      tokens: [{ type: "paragraph", raw: body, text: body, tokens: Lexer.lexInline(body) }],
    };
    const kept: Token[] = before ? [{ ...tok, raw: before, text: before, tokens: Lexer.lexInline(before) } as Token] : [];
    item.tokens.splice(i, 1, ...kept, quote);
    return;
  }
}
