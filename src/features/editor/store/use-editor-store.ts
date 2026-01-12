import { create } from "zustand";

import type { Id } from "../../../../convex/_generated/dataModel";
interface TabState {
  openTabs: Id<"files">[];
  activeTabId: Id<"files"> | null;
  previewTabId: Id<"files"> | null;
}

// 默认的tab状态，这是一整个项目的tab状态
const defaultTabState: TabState = {
  // 打开的tab
  openTabs: [],
  // 活动的tab，活动的tab必定是预览的
  activeTabId: null,
  // 预览的tab，对于预览的tab，如果不是固定状态的tab，那么每当打开一个新的预览，那么就需要替换掉上一个预览，也就是说把上一个预览删除掉
  previewTabId: null,
};

// 编辑器的tab状态
interface EditorStore {
  // 项目的tab状态，每一个项目都管理自己的tab状态，通过项目id来获取
  tabs: Map<Id<"projects">, TabState>;

  // 获取某个项目的tab状态
  getTabState: (projectId: Id<"projects">) => TabState;
  // 打开某个项目的文件
  openFile: (
    projectId: Id<"projects">,
    fileId: Id<"files">,
    // pinned 表示是否固定在tab上
    options: { pinned: boolean }
  ) => void;
  // 关闭某个项目的文件
  closeTab: (projectId: Id<"projects">, fileId: Id<"files">) => void;
  // 关闭某个项目的所有标签
  closeAllTabs: (projectId: Id<"projects">) => void;
  // 设置某个项目的活动标签
  setActiveTab: (projectId: Id<"projects">, fileId: Id<"files">) => void;
}

// 创建zustand store，用于管理编辑器的tab状态
export const useEditorStore = create<EditorStore>()((set, get) => ({
  tabs: new Map(),
  // 获取某个项目的tab状态
  getTabState(projectId) {
    return get().tabs.get(projectId) || defaultTabState;
  },
  openFile(projectId, fileId, { pinned }) {
    // 获取当前所有的tab状态
    const tabs = new Map(get().tabs);
    // 获取当前项目的tab状态
    const tabState = tabs.get(projectId) || defaultTabState;
    const { openTabs, previewTabId } = tabState;
    const isOpen = openTabs.includes(fileId);
    // 第一种情况：如果文件没有打开过并且文件也不是固定文件
    if (!isOpen && !pinned) {
      // 新的tab状态
      const newTabs = previewTabId
        ? // 如果当前有预览的tab，我们需要将预览的tab替换为当前打开的文件，因为文件不是固定的，我们在打开一个文件时，需要替换掉上一个
          // 预览的文件，因为预览不是固定的，打开一个新的预览需要替换掉上一个预览
          openTabs.map(tab => (tab === previewTabId ? fileId : tab))
        : // 如果当前没有预览的tab，那么直接添加到末尾
          [...openTabs, fileId];
      // 设置新的tab状态
      tabs.set(projectId, {
        openTabs: newTabs,
        activeTabId: fileId,
        previewTabId: fileId,
      });
      set({ tabs });
      return;
    }
    //第二种情况：打卡一个固定标签页，这种情况就很简单了，我们只需要添加到末尾即可，并且将活动标签和预览标签设置为当前打开的文件
    if (!isOpen && pinned) {
      tabs.set(projectId, {
        openTabs: [...openTabs, fileId],
        activeTabId: fileId,
        previewTabId: fileId,
      });
      set({ tabs });
      return;
    }
    // 第三种情况：文件已经打开了，但是我们尝试再次打开并固定文件
    const shouldPinned = pinned && previewTabId === fileId;
    tabs.set(projectId, {
      ...tabState,
      activeTabId: fileId,
      previewTabId: shouldPinned ? null : previewTabId,
    });
    set({ tabs });
  },
  closeAllTabs(projectId) {
    const tabs = new Map(get().tabs);
    tabs.set(projectId, defaultTabState);
    set({ tabs });
  },
  closeTab(projectId, fileId) {
    const tabs = new Map(get().tabs);
    const tabState = tabs.get(projectId) || defaultTabState;
    const { openTabs, activeTabId, previewTabId } = tabState;
    // 找到要关闭的文件的索引
    const tabIndex = openTabs.indexOf(fileId);
    // 如果文件不在打开的tab中，那么直接返回
    if (tabIndex === -1) return;
    // 筛选出所有不是要关闭的文件的tab
    const newTabs = openTabs.filter(tab => tab !== fileId);
    // 找到新的活动标签
    let newActiveTabId = activeTabId;
    if (activeTabId === fileId) {
      // 如果当前活动标签是要关闭的文件，并且除了这一个标签外，没有其他标签了，那么活动标签就设置为null
      if (newTabs.length === 0) {
        newActiveTabId = null;
        // 如果要删除的文件的索引大于等于新的tab列表长度，那说明要删除的文件是最后一个文件，那么新的活动标签就设置为倒数第二个文件
      } else if (tabIndex >= newTabs.length) {
        newActiveTabId = newTabs[newTabs.length - 1];
        // 如果要删除的文件的索引小于新的tab列表长度，那说明要删除的文件不是最后一个文件，那么新的活动标签就设置为当前索引的文件
      } else {
        newActiveTabId = newTabs[tabIndex];
      }
    }
    tabs.set(projectId, {
      ...tabState,
      openTabs: newTabs,
      activeTabId: newActiveTabId,
      // 这里需要设置为null，因为我们是把某个文件直接设置为激活状态了，激活状态必定是预览状态
      // previewTabId: previewTabId === fileId ? null : previewTabId,
      previewTabId: previewTabId === fileId ? newActiveTabId : previewTabId,
    });
    set({ tabs });
  },
  setActiveTab(projectId, fileId) {
    const tabs = new Map(get().tabs);
    const tabState = tabs.get(projectId) || defaultTabState;
    tabs.set(projectId, {
      ...tabState,
      activeTabId: fileId,
    });
    set({ tabs });
  },
}));
