/**
 * @file 快速编辑状态管理插件
 * - 定义 Effect：用于“显示”或“隐藏”快速编辑建议
 * - 定义 StateField：存储当前是否显示快速编辑建议
 */

import { StateEffect, StateField } from "@codemirror/state";

// 显示/隐藏快速编辑建议的 Effect
export const showQuickEditEffect = StateEffect.define<boolean>();

// 快速编辑状态管理
export const quickEditState = StateField.define<boolean>({
  create() {
    return false;
  },
  update(value, transaction) {
    // 处理 Effect
    for (const effect of transaction.effects) {
      if (effect.is(showQuickEditEffect)) {
        return effect.value;
      }
    }
    // 处理选区变化
    if (transaction.selection) {
      const selection = transaction.selection.main;
      if (selection.empty) return false;
    }
    return value;
  },
});
