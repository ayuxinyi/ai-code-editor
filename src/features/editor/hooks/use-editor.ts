import { useCallback } from "react";

import type { Id } from "../../../../convex/_generated/dataModel";
import { useEditorStore } from "../store/use-editor-store";

export const useEditor = (projectId: Id<"projects">) => {
  // 获取编辑器Store实例
  const editorStore = useEditorStore();
  // 订阅当前项目的tab状态
  const tabState = useEditorStore(state => state.getTabState(projectId));
  // 打开文件
  const openFile = useCallback(
    (fileId: Id<"files">, options: { pinned: boolean }) => {
      editorStore.openFile(projectId, fileId, options);
    },
    [editorStore, projectId]
  );
  // 关闭标签页
  const closeTab = useCallback(
    (fileId: Id<"files">) => {
      editorStore.closeTab(projectId, fileId);
    },
    [editorStore, projectId]
  );
  // 关闭所有标签页
  const closeAllTabs = useCallback(() => {
    editorStore.closeAllTabs(projectId);
  }, [editorStore, projectId]);
  // 设置活动标签页
  const setActiveTab = useCallback(
    (fileId: Id<"files">) => {
      editorStore.setActiveTab(projectId, fileId);
    },
    [editorStore, projectId]
  );

  return {
    openTabs: tabState.openTabs,
    activeTabId: tabState.activeTabId,
    previewTabId: tabState.previewTabId,
    openFile,
    closeTab,
    closeAllTabs,
    setActiveTab,
  };
};
