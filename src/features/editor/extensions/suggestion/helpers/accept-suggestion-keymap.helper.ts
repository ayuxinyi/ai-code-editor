/**
 * @file 接受AI建议按键映射
 * - 定义 Tab 键的行为：接受当前 AI 建议并插入到编辑器中
 */

import { keymap } from "@codemirror/view";

import {
  setSuggestionsEffect,
  suggestionState,
} from "./suggestion-state.helper";

// 定义一个按键映射，用于接受AI给出的建议
export const acceptSuggestionKeymap = keymap.of([
  {
    // 监听 Tab 键
    key: "Tab",
    // 定义Tab键的行为
    run(view) {
      // 获取当前AI建议
      const suggestion = view.state.field(suggestionState);
      // 如果没有建议，则返回false，按照默认行为处理，也就是对齐缩进
      if (!suggestion) return false;
      // 获取光标位置
      const cursor = view.state.selection.main.head;
      // 插入建议文本
      view.dispatch({
        // 使用 transaction 对编辑器进行操作
        changes: {
          // 从光标位置开始插入建议文本
          from: cursor,
          // 插入建议文本
          insert: suggestion,
        },
        // 更新光标位置
        selection: {
          // 光标位置移动到建议文本的末尾
          anchor: cursor + suggestion.length,
        },
        // 清空AI建议
        effects: setSuggestionsEffect.of(null),
      });
      // 阻止默认行为，也就是不缩进, 直接插入建议文本
      return true;
    },
  },
]);
