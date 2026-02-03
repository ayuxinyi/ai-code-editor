import type { FileSystemTree } from "@webcontainer/api";

import type { Doc, Id } from "../../../../convex/_generated/dataModel";

type FileDoc = Doc<"files">;

/**
 * 将convex返回的文件数组转换为webcontainer的文件系统树
 * @param files convex返回的文件数组
 * @returns webcontainer的文件系统树
 */
export const buildFileTree = (files: Array<FileDoc>): FileSystemTree => {
  const tree: FileSystemTree = {};
  // 1.先将文件数组转换为Map，方便后续查找,key为文件id,value为文件对象
  const filesMap = new Map(files.map(file => [file._id, file]));

  // 2.获取文件的路径数组，通过while循环递归获取父目录，直到根目录
  const getFilePath = (file: FileDoc): Array<string> => {
    // 2.1 初始化路径数组，将当前文件的名称添加到数组中
    const parts: Array<string> = [file.name];
    let parentId = file.parentId;
    // 2.2 循环获取父目录，直到根目录
    while (parentId) {
      const parent = filesMap.get(parentId);
      if (!parent) {
        break;
      }
      // 2.3 将父目录的名称添加到路径数组的开头
      parts.unshift(parent.name);
      // 2.4 继续获取上一级父目录
      parentId = parent.parentId;
    }
    // 2.5 返回文件的路径数组
    return parts;
  };
  // 3. 遍历文件数组，为每个文件创建对应的路径
  for (const file of files) {
    // 3.1 获取文件的路径数组
    const pathParts = getFilePath(file);
    // 3.2 初始化当前节点为根目录
    let current = tree;
    // 3.3 遍历路径数组，为每个路径创建对应的节点
    for (let i = 0; i < pathParts.length; i++) {
      const part = pathParts[i];
      const isLast = i === pathParts.length - 1;
      // 3.4 如果是最后一个路径，根据文件类型创建对应的节点
      if (isLast) {
        // 3.4.1 如果是文件夹，创建一个空的目录节点
        if (file.type === "folder") {
          current[part] = { directory: {} };
        } else if (!file.storageId && file.content !== undefined) {
          // 3.4.2 如果是文件，创建一个包含文件内容的节点
          current[part] = { file: { contents: file.content } };
        }
      } else {
        // 3.5 如果不是最后一个路径
        // 3.5.1 如果当前节点不存在该路径的子节点，创建一个空的目录节点
        if (!current[part]) {
          current[part] = { directory: {} };
        }
        // 3.5.2 获取当前路径的节点
        const node = current[part];
        // 3.5.3 如果当前节点是目录节点，将当前节点指向子目录节点，继续遍历下一个路径
        if ("directory" in node) {
          current = node.directory;
        }
      }
    }
  }
  return tree;
};

/**
 * 获取文件的完整路径
 * @param file 文件对象
 * @param filesMap 文件Map，key为文件id，value为文件对象
 * @returns 文件的完整路径
 */
export const getFileFullPath = (
  file: FileDoc,
  filesMap: Map<Id<"files">, FileDoc>,
) => {
  let parentId = file.parentId;
  let fullPath = file.name;
  while (parentId) {
    const parent = filesMap.get(parentId);
    if (!parent) {
      break;
    }
    fullPath = parent.name + "/" + fullPath;
    parentId = parent.parentId;
  }
  return fullPath;
};
