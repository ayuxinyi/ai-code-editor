import { quickEditKeymap, quickEditState } from "./helpers";
import {
  captureViewExtension,
  quickEditTooltipField,
} from "./helpers/quick-edit-tooltip-field";

export const quickEdit = (fileName: string) => [
  // 快速编辑状态管理,管理是否需要展示快速编辑的Tooltip
  quickEditState,
  // 快速编辑Tooltip字段,渲染快速编辑的Tooltip，进行快速编辑
  quickEditTooltipField,
  // 快速编辑键盘映射,用于触发快速编辑
  quickEditKeymap,
  // 捕获EditorView实例,用于在Tooltip中获取编辑器的DOM元素
  captureViewExtension,
];
