import { type EditorState, StateField } from "@codemirror/state";
import type { Tooltip } from "@codemirror/view";
import { EditorView, showTooltip } from "@codemirror/view";

import { showQuickEditEffect } from "./quick-edit/helpers";

let editorView: EditorView | null = null;

const createToolTipForSelection = (state: EditorState): readonly Tooltip[] => {
  const selection = state.selection.main;
  if (selection.empty) return [];
  return [
    {
      pos: selection.to,
      above: false,
      strictSide: false,
      create() {
        const dom = document.createElement("div");
        dom.className =
          "bg-popover text-popover-foreground p-2 rounded-sm z-50 border border-input p-1 shadow-md flex items-center gap-2 text-sm";

        const addToChatButton = document.createElement("button");
        addToChatButton.textContent = "添加到聊天";
        addToChatButton.className =
          "font-sans p-1 px-2 hover:bg-foreground/10 rounded-sm";

        const quickEditButton = document.createElement("button");
        quickEditButton.className =
          "font-sans p-1 px-2 hover:bg-foreground/10 rounded-sm flex items-center gap-1";

        const quickEditSpan = document.createElement("span");
        quickEditSpan.textContent = "快速编辑";

        const quickEditButtonShortcut = document.createElement("span");
        quickEditButtonShortcut.textContent = "Ctrl+K";
        quickEditButtonShortcut.className = "text-sm opacity-60";

        quickEditButton.appendChild(quickEditSpan);
        quickEditButton.appendChild(quickEditButtonShortcut);

        quickEditButton.onclick = () => {
          if (!editorView) return;
          editorView.dispatch({
            effects: showQuickEditEffect.of(true),
          });
        };

        dom.appendChild(addToChatButton);
        dom.appendChild(quickEditButton);

        return { dom };
      },
    },
  ];
};

const selectionTooltipField = StateField.define<readonly Tooltip[]>({
  create(state) {
    return createToolTipForSelection(state);
  },
  update(tooltips, transaction) {
    if (transaction.docChanged || transaction.selection) {
      return createToolTipForSelection(transaction.state);
    }
    for (const effect of transaction.effects) {
      if (effect.is(showQuickEditEffect)) {
        return createToolTipForSelection(transaction.state);
      }
    }
    return tooltips;
  },
  provide: field => showTooltip.computeN([field], state => state.field(field)),
});

const captureViewExtension = EditorView.updateListener.of(update => {
  editorView = update.view;
});
export const selectionTooltip = () => [
  selectionTooltipField,
  captureViewExtension,
];
