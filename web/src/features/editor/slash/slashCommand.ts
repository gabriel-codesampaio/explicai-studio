import { flip, size } from "@floating-ui/dom";
import { Extension } from "@tiptap/core";
import { ReactRenderer } from "@tiptap/react";
import Suggestion from "@tiptap/suggestion";
import { type Block, searchBlocks } from "../blocks";
import { collisionPadding } from "../editorArea";
import { SlashMenu, type SlashMenuHandle } from "./SlashMenu";

export interface SlashOptions {
  /** Abre o seletor de arquivo do navegador para o bloco "Imagem". */
  pickImage: () => void;
}

/** Digitar "/" abre o menu de blocos na posição do cursor. */
export const SlashCommand = Extension.create<SlashOptions>({
  name: "slashCommand",

  addOptions() {
    return { pickImage: () => {} };
  },

  addProseMirrorPlugins() {
    const { pickImage } = this.options;
    return [
      Suggestion<Block>({
        editor: this.editor,
        char: "/",
        startOfLine: false,
        // Abre onde cabe entre a barra fixa e o rodapé; sem espaço dos dois lados, a lista rola por dentro.
        flip: false,
        floatingUi: {
          middleware: [
            flip(() => ({ padding: collisionPadding() })),
            size(() => ({
              padding: collisionPadding(),
              apply: ({ availableHeight, elements }) =>
                elements.floating.style.setProperty("--slash-max-h", `${availableHeight}px`),
            })),
          ],
        },
        // Só no começo de um bloco vazio ou depois de um espaço, para não disparar em "e/ou".
        allow: ({ state, range }) => {
          const before = state.doc.textBetween(Math.max(range.from - 1, 0), range.from, "\n", "\n");
          return before === "" || before === " " || before === "\n";
        },
        items: ({ query }) => searchBlocks(query),
        command: ({ editor, range, props: block }) => {
          editor.chain().focus().deleteRange(range).run();
          block.run({ editor, pickImage });
        },
        render: () => {
          let component: ReactRenderer<SlashMenuHandle> | null = null;
          let unmount: (() => void) | null = null;
          return {
            onStart: (props) => {
              component = new ReactRenderer(SlashMenu, { props, editor: props.editor });
              unmount = props.mount(component.element);
            },
            onUpdate: (props) => component?.updateProps(props),
            onKeyDown: ({ event }) => {
              if (event.key === "Escape") return false;
              return component?.ref?.onKeyDown(event) ?? false;
            },
            onExit: () => {
              unmount?.();
              component?.destroy();
            },
          };
        },
      }),
    ];
  },
});
