import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";

import type { Doc } from "../../../../convex/_generated/dataModel";

/**
 * 格式化时间戳为相对时间字符串
 * @param timestamp 时间戳，单位毫秒
 * @returns 格式化后的时间字符串，例如："10分钟前"
 */
export const formatTimestamp = (timestamp: number) => {
  return formatDistanceToNow(new Date(timestamp), {
    addSuffix: true,
    locale: zhCN,
  });
};

/**
 * 对文件列表进行排序，文件夹优先，文件名按字典序排序
 * @param files 文件列表
 * @returns 排序后的文件列表
 */
export const sortFiles = (files: Array<Doc<"files">>) => {
  return [...files].sort((a, b) => {
    if (a.type === "folder" && b.type === "file") return -1;
    if (a.type === "file" && b.type === "folder") return 1;
    return a.name.localeCompare(b.name);
  });
};
