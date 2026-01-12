// 最小地图扩展
import { showMinimap } from "@replit/codemirror-minimap";

// 创建最小地图
export const createMinimap = () => {
  const dom = document.createElement("div");
  return { dom };
};

// 最小地图插件
export const minimap = () => [
  showMinimap.compute(["doc"], () => ({
    create: createMinimap,
  })),
];
