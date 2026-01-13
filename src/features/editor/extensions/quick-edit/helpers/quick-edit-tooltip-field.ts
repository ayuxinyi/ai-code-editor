/**
 * @file 快速编辑Tooltip字段
 * - 定义快速编辑的Tooltip字段，用于在选中文本时显示快速编辑的输入框
 */

import { type EditorState, StateField } from "@codemirror/state";
import { EditorView, showTooltip, type Tooltip } from "@codemirror/view";

import { fetcher } from "../fetcher";
import { quickEditState, showQuickEditEffect } from "./quick-edit-state.helper";

let currentAbortController: AbortController | null = null;
let editorView: EditorView | null = null;

// 创建一个快速编辑的Tooltip
const createQuickEditTooltip = (state: EditorState): readonly Tooltip[] => {
  // 获取当前选中的文本
  const selection = state.selection.main;
  // 如果选中的文本为空，返回空数组
  if (selection.empty) return [];

  // 获取当前quickEditState状态
  const isQuickEditActive = state.field(quickEditState);
  if (!isQuickEditActive) return [];

  return [
    {
      // 定义Tooltip的位置，这里设置为选中文本的结束位置
      pos: selection.to,
      // 当视口无法显示Tooltip时，将Tooltip显示在选中文本的上方
      above: false,
      // 严格按照Tooltip的位置进行渲染，不允许超出视口边界
      strictSide: false,
      // 创建Tooltip的DOM元素
      create() {
        const dom = document.createElement("div");
        dom.className =
          "bg-popover text-popover-foreground z-50 rounded-sm border border-input p-2 shadow-md flex flex-col gap-2 text-sm";
        const form = document.createElement("form");
        form.className = "flex flex-col gap-2";

        const input = document.createElement("input");
        input.placeholder = "编辑选中的代码...";
        input.className =
          "bg-transparent border-none outline-none px-2 py-1 font-sans w-100";
        input.type = "text";
        input.autofocus = true;

        const buttonContainer = document.createElement("div");
        buttonContainer.className = "flex items-center justify-between gap-2";

        const cancelButton = document.createElement("button");
        cancelButton.type = "button";
        cancelButton.className =
          "font-sans p-1 px-2 text-muted-foreground hover:text-muted-foreground hover:bg-foreground/10 rounded-sm";
        cancelButton.textContent = "取 消";
        cancelButton.onclick = () => {
          // 取消当前的请求
          if (currentAbortController) {
            currentAbortController.abort();
            currentAbortController = null;
          }

          if (editorView) {
            editorView.dispatch({
              effects: showQuickEditEffect.of(false),
            });
          }
        };

        const acceptButton = document.createElement("button");
        acceptButton.type = "submit";
        acceptButton.className =
          "font-sans p-1 px-2 text-foreground bg-foreground/10 hover:bg-foreground/20 rounded-sm";
        acceptButton.textContent = "提 交";
        acceptButton.onclick = async ev => {
          ev.preventDefault();
          if (!editorView) return;

          const instruction = input.value.trim();
          if (!instruction) return;
          // 获取当前选中的文本
          const selection = editorView.state.selection.main;
          // 获取选中的代码
          const selectCode = editorView.state.doc.sliceString(
            selection.from,
            selection.to
          );
          // 获取当前文档的完整代码
          const fullCode = editorView.state.doc.toString();
          acceptButton.disabled = true;
          acceptButton.textContent = "编辑中...";
          currentAbortController = new AbortController();
          // 调用 fetcher 函数，获取编辑后的代码
          const editCode = await fetcher(
            {
              selectCode,
              fullCode,
              instruction,
            },
            currentAbortController.signal
          );

          // 如果获取到编辑后的代码
          if (editCode) {
            // 替换选中的代码为编辑后的代码
            editorView.dispatch({
              changes: {
                from: selection.from,
                to: selection.to,
                insert: editCode,
              },
              selection: {
                // 将光标移动到编辑后的代码的末尾
                anchor: selection.from + editCode.length,
              },
              // 清除quickEditState状态
              effects: showQuickEditEffect.of(false),
            });
          } else {
            // 如果没有获取到编辑后的代码，将按钮恢复为初始状态
            acceptButton.disabled = false;
            acceptButton.textContent = "提 交";
          }
          currentAbortController = null;
        };

        buttonContainer.appendChild(cancelButton);
        buttonContainer.appendChild(acceptButton);

        form.appendChild(input);
        form.appendChild(buttonContainer);

        dom.appendChild(form);

        setTimeout(() => {
          input.focus();
        }, 0);

        return { dom };
      },
    },
  ];
};

// 定义一个状态字段，用于存储快速编辑的Tooltip
export const quickEditTooltipField = StateField.define<readonly Tooltip[]>({
  // 初始化时创建Tooltip
  create(state) {
    return createQuickEditTooltip(state);
  },
  // 更新Tooltip
  update(tooltips, transaction) {
    // 如果文档发生改变或选择发生改变，重新创建Tooltip
    if (transaction.docChanged || transaction.selection) {
      return createQuickEditTooltip(transaction.state);
    }
    // 如果有显示快速编辑的效果，且值为true，重新创建Tooltip
    for (const effect of transaction.effects) {
      if (effect.is(showQuickEditEffect)) {
        // 如果点击取消时，想要隐藏Tooltip，那这里就不能做effect.value的判断，因为此时effect.value为false
        // 如果希望点击取消时，只是清空请求，那这里可以加上effect.value的判断，这不会重新创建Tooltip
        // if (effect.value) {
        return createQuickEditTooltip(transaction.state);
        // }
      }
    }
    return tooltips;
  },
  // 提供Tooltip
  provide: field => showTooltip.computeN([field], state => state.field(field)),
});

// 定义一个更新监听器，用于捕获EditorView实例
export const captureViewExtension = EditorView.updateListener.of(update => {
  editorView = update.view;
});
