/**
 * @file AI 建议状态管理插件
 * - 定义 Effect：用于“发送”AI 建议更新事件
 * - 定义 StateField：存储当前 AI 建议文本
 */

import { StateEffect, StateField } from "@codemirror/state";

// 定义 Effect：用于“发送”AI 建议更新事件
// Effect 只是一个“信号类型”，本身不做任何事情，真正的状态更新发生在 StateField.update 中
export const setSuggestionsEffect = StateEffect.define<string | null>();

// 定义 StateField：存储当前 AI 建议文本
export const suggestionState = StateField.define<string | null>({
  // 编辑器初始化时调用，返回初始值
  create() {
    return null;
  },
  // 更新状态字段，每一次 transaction 都会进入这里
  update(value, transaction) {
    // 我们在这里只需要关注有没有 setSuggestionsEffect 效果
    // 如果有，则返回该效果的值
    // 否则,返回当前值
    for (const effect of transaction.effects) {
      if (effect.is(setSuggestionsEffect)) {
        return effect.value;
      }
    }
    return value;
  },
});
