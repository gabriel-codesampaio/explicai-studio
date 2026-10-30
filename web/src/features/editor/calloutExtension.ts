import { ReactNodeViewRenderer } from "@tiptap/react";
import { CalloutView } from "./CalloutView";
import { Callout } from "./callout";

/** O alerta com a visualização do editor. O Markdown é o mesmo do `Callout` simples, usado nos testes. */
export const CalloutWithView = Callout.extend({
  addNodeView() {
    return ReactNodeViewRenderer(CalloutView);
  },
});
