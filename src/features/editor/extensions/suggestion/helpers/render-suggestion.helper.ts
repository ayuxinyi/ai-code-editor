/**
 * @file AI 建议渲染插件
 * - 监听编辑器变化
 * - 从 StateField 读取建议
 * - 生成 Decoration 交给编辑器渲染
 */

import type { DecorationSet, EditorView, ViewUpdate } from "@codemirror/view";
import { Decoration, ViewPlugin, WidgetType } from "@codemirror/view";

import { MIN_SUGGESTION_NEEDED_LINES } from "@/constants";

import { fetcher } from "../fetcher";
import {
  setSuggestionsEffect,
  suggestionState,
} from "./suggestion-state.helper";

// 定义一个自定义的小部件，用于对建议文本进行渲染
class SuggestionWidget extends WidgetType {
  constructor(readonly text: string) {
    super();
  }

  // 创建自定义的dom元素，用于展示AI给出的建议
  toDOM(): HTMLElement {
    const span = document.createElement("span");
    span.textContent = this.text;
    span.style.opacity = "0.4";
    span.style.pointerEvents = "none";
    return span;
  }
}

// 定义一个防抖函数，用于限制AI建议的渲染频率
let debounceTimer: number | null = null;
// 定义一个标志，用于判断是否正在等待AI建议
let isWaitingForSuggestion = false;
// 定义一个防抖延迟时间，单位毫秒
const DEBOUNCE_DELAY = 300;

let currentAbortController: AbortController | null = null;

// 生成获取AI建议接口所需的参数
const generateAIPayload = (view: EditorView, fileName: string) => {
  const code = view.state.doc.toString();
  if (!code || code.trim().length === 0) return null;
  // 获取光标位置
  const cursorPosition = view.state.selection.main.head;
  // 获取光标所在的当前行
  const currentLine = view.state.doc.lineAt(cursorPosition);
  // 获取光标在当前行的位置
  const cursorInLine = cursorPosition - currentLine.from;
  const previousLine: string[] = [];
  // 获取当前行前面的5行,currentLine.number - 1代表当前行之前的行数
  const previousLineToFetch = Math.min(
    MIN_SUGGESTION_NEEDED_LINES,
    currentLine.number - 1
  );
  // 遍历当前行前面的5行，将每行的文本添加到previousLine数组
  for (let i = previousLineToFetch; i >= 1; i--) {
    previousLine.push(view.state.doc.line(currentLine.number - i).text);
  }

  // 存储当前行后面的行
  const nextLines: string[] = [];
  // 获取总行数
  const totalLines = view.state.doc.lines;
  // 获取当前行后面的5行,totalLines - currentLine.number代表当前行之后的行数
  const linesToFetch = Math.min(
    MIN_SUGGESTION_NEEDED_LINES,
    totalLines - currentLine.number
  );
  // 遍历当前行后面的5行，将每行的文本添加到nextLines数组
  for (let i = 1; i <= linesToFetch; i++) {
    nextLines.push(view.state.doc.line(currentLine.number + i).text);
  }
  return {
    // 文件名
    fileName,
    // 整个文件的代码
    code,
    // 当前行的文本内容
    currentLine: currentLine.text,
    // 当前行前5行的文本内容
    previousLines: previousLine.join("\n"),
    // 光标之前的文本内容
    textBeforeCursor: currentLine.text.slice(0, cursorInLine),
    // 光标之后的文本内容
    textAfterCursor: currentLine.text.slice(cursorInLine),
    // 当前行后5行的文本内容
    nextLines: nextLines.join("\n"),
    // 当前行的行号
    lineNumber: currentLine.number,
  };
};

// AI 建议辅助函数
// - 防抖函数：用于限制AI建议的渲染频率
// - 生成AI建议：根据当前文本内容生成AI建议
export const createSuggestionDebouncePlugin = (fileName: string) => {
  return ViewPlugin.fromClass(
    class {
      // 插件创建时调用，触发一次AI建议
      constructor(view: EditorView) {
        this.triggerSuggestion(view);
      }

      // 插件更新时调用，根据文档变化或选择变化触发AI建议
      update(update: ViewUpdate) {
        if (update.docChanged || update.selectionSet) {
          this.triggerSuggestion(update.view);
        }
      }

      // 触发AI建议，根据当前文本内容生成AI建议
      triggerSuggestion(view: EditorView) {
        // 如果正在等待AI建议，则直接返回
        // if (isWaitingForSuggestion) return;
        // 如果存在防抖定时器，清除它
        if (debounceTimer) clearTimeout(debounceTimer);
        // 如果存在当前的 AbortController，取消它
        if (currentAbortController) {
          currentAbortController.abort();
        }
        // 设置等待标志为 true
        isWaitingForSuggestion = true;
        // 启动一个新的防抖定时器
        debounceTimer = window.setTimeout(async () => {
          // 生成AI建议接口所需的参数
          const payload = generateAIPayload(view, fileName);
          if (!payload) {
            isWaitingForSuggestion = false;
            view.dispatch({
              effects: setSuggestionsEffect.of(null),
            });
            return;
          }
          // 创建取消请求的 AbortController
          currentAbortController = new AbortController();
          // 生成AI建议
          const suggestion = await fetcher(
            payload,
            currentAbortController.signal
          );
          isWaitingForSuggestion = false;
          // 发送AI建议更新事件
          view.dispatch({
            effects: setSuggestionsEffect.of(suggestion),
          });
        }, DEBOUNCE_DELAY);
      }

      // 插件销毁时调用，清除防抖定时器
      destroy() {
        if (debounceTimer !== null) clearTimeout(debounceTimer);
        if (currentAbortController !== null) currentAbortController.abort();
      }
    }
  );
};

// 渲染插件，用于渲染AI给出的建议
//  - 监听编辑器变化
//  - 从 StateField 读取建议
//  - 生成 Decoration 交给编辑器渲染
export const renderSuggestionPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = this.build(view);
    }

    // 当文档更改，光标移动，effect触发等，都会触发 update 方法
    update(update: ViewUpdate) {
      // 查找是否有设置AI给出的建议的效果
      const suggestionChanged = update.transactions.some(transaction =>
        transaction.effects.some(effect => effect.is(setSuggestionsEffect))
      );
      const shouldRebuild =
        update.docChanged || update.selectionSet || suggestionChanged;
      // 如果文档更改了，选中区域发生了变化，或者AI建议发生了变化，则重新渲染
      if (shouldRebuild) {
        this.decorations = this.build(update.view);
      }
    }

    // 构建装饰器，用于渲染AI给出的建议
    build(view: EditorView) {
      // 如果正在等待AI建议，则返回空装饰
      if (isWaitingForSuggestion) return Decoration.none;
      // 获取当前AI建议
      const suggestion = view.state.field(suggestionState);
      // 如果没有建议，则返回空装饰
      if (!suggestion) {
        return Decoration.none;
      }

      // 我们需要创建一个区域，用于渲染建议列表，并且该区域需要在光标位置
      // 获取光标位置
      const cursor = view.state.selection.main.head;
      return Decoration.set([
        // 创建一个装饰，用于渲染建议列表
        Decoration.widget({
          widget: new SuggestionWidget(suggestion),
          // 在光标之后渲染，如果是负数，则在光标之前渲染
          side: 1,
          // 只在光标位置渲染
        }).range(cursor),
      ]);
    }
  },
  // 通知codemirror，在进行渲染时使用该装饰
  { decorations: plugin => plugin.decorations }
);
