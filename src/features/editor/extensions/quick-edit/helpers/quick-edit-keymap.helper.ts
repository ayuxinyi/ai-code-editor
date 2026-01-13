/**
 * @file 快速编辑按键映射
 * - 定义 Mod-k 键的行为：开启/关闭快速编辑
 */

import { keymap } from "@codemirror/view";

import { showQuickEditEffect } from "./quick-edit-state.helper";

// 定义一个按键映射，用于开启/关闭快速编辑
export const quickEditKeymap = keymap.of([
  {
    // 监听 Mod-k 键
    key: "Mod-k",
    // 定义Mod-k键的行为
    run(view) {
      const selection = view.state.selection.main;
      if (selection.empty) return false;
      view.dispatch({
        effects: showQuickEditEffect.of(true),
      });
      return true;
    },
  },
]);
