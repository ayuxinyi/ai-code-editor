// import { StateEffect, StateField } from "@codemirror/state";
// import type { DecorationSet, EditorView, ViewUpdate } from "@codemirror/view";
// import { Decoration, keymap, ViewPlugin, WidgetType } from "@codemirror/view";

import {
  acceptSuggestionKeymap,
  createSuggestionDebouncePlugin,
  renderSuggestionPlugin,
  suggestionState,
} from "./helpers";

// // 定义 Effect：用于“发送”AI 建议更新事件
// // Effect 只是一个“信号类型”，本身不做任何事情，真正的状态更新发生在 StateField.update 中
// const setSuggestionsEffect = StateEffect.define<string | null>();

// // 定义 StateField：存储当前 AI 建议文本
// const suggestionState = StateField.define<string | null>({
//   // 编辑器初始化时调用，返回初始值
//   create() {
//     return null;
//   },
//   // 更新状态字段，每一次 transaction 都会进入这里
//   update(value, transaction) {
//     // 我们在这里只需要关注有没有 setSuggestionsEffect 效果
//     // 如果有，则返回该效果的值
//     // 否则,返回当前值
//     for (const effect of transaction.effects) {
//       if (effect.is(setSuggestionsEffect)) {
//         return effect.value;
//       }
//     }
//     return value;
//   },
// });

// // 定义一个自定义的小部件，用于对建议文本进行渲染
// class SuggestionWidget extends WidgetType {
//   constructor(readonly text: string) {
//     super();
//   }

//   // 创建自定义的dom元素，用于展示AI给出的建议
//   toDOM(): HTMLElement {
//     const span = document.createElement("span");
//     span.textContent = this.text;
//     span.style.opacity = "0.4";
//     span.style.pointerEvents = "none";
//     return span;
//   }
// }

// // 定义一个防抖函数，用于限制AI建议的渲染频率
// let debounceTimer: number | null = null;
// // 定义一个标志，用于判断是否正在等待AI建议
// let isWaitingForSuggestion = false;
// // 定义一个防抖延迟时间，单位毫秒
// const DEBOUNCE_DELAY = 300;

// const generateFakeSuggestion = (textBeforeCursor: string) => {
//   // 去除文本末尾的空格
//   const trimmed = textBeforeCursor.trimEnd();
//   if (trimmed.endsWith("const")) return "myVariable = ";
//   if (trimmed.endsWith("function")) return "myFunction() { }";
//   if (trimmed.endsWith("console.")) return "log()";
//   if (trimmed.endsWith("return")) return "null";
//   return null;
// };

// const createDebouncePlugin = (fileName: string) => {
//   return ViewPlugin.fromClass(
//     class {
//       constructor(view: EditorView) {
//         this.triggerSuggestion(view);
//       }

//       update(update: ViewUpdate) {
//         if (update.docChanged || update.selectionSet) {
//           this.triggerSuggestion(update.view);
//         }
//       }

//       triggerSuggestion(view: EditorView) {
//         if (isWaitingForSuggestion) return;
//         if (debounceTimer) clearTimeout(debounceTimer);
//         isWaitingForSuggestion = true;
//         debounceTimer = window.setTimeout(async () => {
//           // 获取光标位置
//           const cursor = view.state.selection.main.head;
//           // 找当当前所在的行
//           const line = view.state.doc.lineAt(cursor);
//           // 获取光标前面的文本
//           const textBeforeCursor = line.text.slice(0, cursor - line.from);
//           // 生成AI建议
//           const suggestion = generateFakeSuggestion(textBeforeCursor);
//           // 发送AI建议更新事件
//           isWaitingForSuggestion = false;
//           view.dispatch({
//             effects: setSuggestionsEffect.of(suggestion),
//           });
//         }, DEBOUNCE_DELAY);
//       }
//     }
//   );
// };

// // 渲染插件，用于渲染AI给出的建议
// //  - 监听编辑器变化
// //  - 从 StateField 读取建议
// //  - 生成 Decoration 交给编辑器渲染
// const renderPlugin = ViewPlugin.fromClass(
//   class {
//     decorations: DecorationSet;

//     constructor(view: EditorView) {
//       this.decorations = this.build(view);
//     }

//     // 当文档更改，光标移动，effect触发等，都会触发 update 方法
//     update(update: ViewUpdate) {
//       // 查找是否有设置AI给出的建议的效果
//       const suggestionChanged = update.transactions.some(transaction =>
//         transaction.effects.some(effect => effect.is(setSuggestionsEffect))
//       );
//       const shouldRebuild =
//         update.docChanged || update.selectionSet || suggestionChanged;
//       // 如果文档更改了，选中区域发生了变化，或者AI建议发生了变化，则重新渲染
//       if (shouldRebuild) {
//         this.decorations = this.build(update.view);
//       }
//     }

//     // 构建装饰器，用于渲染AI给出的建议
//     build(view: EditorView) {
//       // 如果正在等待AI建议，则返回空装饰
//       if (isWaitingForSuggestion) return Decoration.none;
//       // 获取当前AI建议
//       const suggestion = view.state.field(suggestionState);
//       // 如果没有建议，则返回空装饰
//       if (!suggestion) {
//         return Decoration.none;
//       }

//       // 我们需要创建一个区域，用于渲染建议列表，并且该区域需要在光标位置
//       // 获取光标位置
//       const cursor = view.state.selection.main.head;
//       return Decoration.set([
//         // 创建一个装饰，用于渲染建议列表
//         Decoration.widget({
//           widget: new SuggestionWidget(suggestion),
//           // 在光标之后渲染，如果是负数，则在光标之前渲染
//           side: 1,
//           // 只在光标位置渲染
//         }).range(cursor),
//       ]);
//     }
//   },
//   // 通知codemirror，在进行渲染时使用该装饰
//   { decorations: plugin => plugin.decorations }
// );

// // 定义一个按键映射，用于接受AI给出的建议
// const acceptSuggestionKeymap = keymap.of([
//   {
//     // 监听 Tab 键
//     key: "Tab",
//     // 定义Tab键的行为
//     run(view) {
//       // 获取当前AI建议
//       const suggestion = view.state.field(suggestionState);
//       // 如果没有建议，则返回false，按照默认行为处理，也就是对齐缩进
//       if (!suggestion) return false;
//       // 获取光标位置
//       const cursor = view.state.selection.main.head;
//       // 插入建议文本
//       view.dispatch({
//         // 使用 transaction 对编辑器进行操作
//         changes: {
//           // 从光标位置开始插入建议文本
//           from: cursor,
//           // 插入建议文本
//           insert: suggestion,
//         },
//         // 更新光标位置
//         selection: {
//           // 光标位置移动到建议文本的末尾
//           anchor: cursor + suggestion.length,
//         },
//         // 清空AI建议
//         effects: setSuggestionsEffect.of(null),
//       });
//       // 阻止默认行为，也就是不缩进, 直接插入建议文本
//       return true;
//     },
//   },
// ]);

export const suggestion = (fileName: string) => [
  suggestionState,
  createSuggestionDebouncePlugin(fileName),
  renderSuggestionPlugin,
  acceptSuggestionKeymap,
];
