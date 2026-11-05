/**
 * Modelos de página (T-546): só o corpo inicial em Markdown, enviado na criação. Nada fica salvo além da página.
 * O texto é conteúdo do manual, então segue o idioma do manual (como o "Resultado:"), não o da interface.
 * Trechos entre colchetes são exemplo para a pessoa trocar.
 */
export type TemplateId = "task" | "reference";

const TASK_PT = `Use esta página quando [o que a pessoa quer fazer].

## Antes de começar

- [O que você precisa ter em mãos.]

## Passo a passo

1. Abra [a tela ou o menu].
   Resultado: [o que aparece na tela.]
2. Clique em [o botão].
   Resultado: [o que muda depois do clique.]
3. Confira [o dado ou a mensagem].
   Resultado: [o sinal de que deu certo.]

## Se algo der errado

[O problema mais comum e como resolver.]
`;

const TASK_EN = `Use this page when [what the reader wants to do].

## Before you start

- [What you need at hand.]

## Step by step

1. Open [the screen or menu].
   Result: [what appears on the screen.]
2. Click [the button].
   Result: [what changes after the click.]
3. Check [the data or the message].
   Result: [the sign that it worked.]

## If something goes wrong

[The most common problem and how to fix it.]
`;

const REFERENCE_PT = `Esta página explica os campos de [nome da tela].

## Campos

| Campo | O que é | Obrigatório |
| --- | --- | --- |
| [Nome do campo] | [O que você preenche aqui.] | [Sim ou não] |
| [Nome do campo] | [O que você preenche aqui.] | [Sim ou não] |

## Observações

[Regra ou exceção que vale para mais de um campo.]
`;

const REFERENCE_EN = `This page explains the fields on [screen name].

## Fields

| Field | What it is | Required |
| --- | --- | --- |
| [Field name] | [What you fill in here.] | [Yes or no] |
| [Field name] | [What you fill in here.] | [Yes or no] |

## Notes

[A rule or exception that applies to more than one field.]
`;

const BODIES: Record<TemplateId, { pt: string; en: string }> = {
  task: { pt: TASK_PT, en: TASK_EN },
  reference: { pt: REFERENCE_PT, en: REFERENCE_EN },
};

/** Corpo inicial do modelo no idioma do manual ("pt-BR", "en"...). */
export function templateBody(id: TemplateId, manualLanguage: string): string {
  return BODIES[id][manualLanguage.toLowerCase().startsWith("pt") ? "pt" : "en"];
}
