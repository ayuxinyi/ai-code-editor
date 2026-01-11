export const LIMIT_NUMBER = 6;
// 侧边栏最小宽度
export const MIN_SIDEBAR_WIDTH = 200;
// 侧边栏最大宽度
export const MAX_SIDEBAR_WIDTH = 800;
// 对话框侧边栏宽度
export const DEFAULT_CONVERSATION_SIDEBAR_WIDTH = 400;
// 主区域宽度
export const DEFAULT_MAIN_SIZE = 1000;
// 文件目录侧边栏宽度
export const DEFAULT_FILE_DIRECTORY_SIDEBAR_WIDTH = 350;
// 默认侧边栏宽度
export const DEFAULT_SIDEBAR_WIDTH = 400;

// 文件目录文件距离左侧的padding
export const BASE_PADDING = 12;
export const LEVEL_PADDING = 12;

// 文件目录文件距离左侧的padding计算
export const getItemPadding = (level: number, isFile: boolean = true) => {
  const fileOffset = isFile ? 16 : 0;
  return BASE_PADDING + level * LEVEL_PADDING + fileOffset;
};
