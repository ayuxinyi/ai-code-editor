"use client";

import { Allotment } from "allotment";
import { type FC, useState } from "react";

import {
  DEFAULT_FILE_DIRECTORY_SIDEBAR_WIDTH,
  DEFAULT_MAIN_SIZE,
  DEFAULT_SIDEBAR_WIDTH,
  MAX_SIDEBAR_WIDTH,
  MIN_SIDEBAR_WIDTH,
} from "@/constants";
import { EditorSection } from "@/features/editor/ui/sections/editor-section";
import { PreviewSection } from "@/features/preview/ui/sections/preview-section";
import { cn } from "@/lib/utils";

import type { Id } from "../../../../../convex/_generated/dataModel";
import { FileExplorer } from "../components/file-explorer";
import { ExportToGithubPopover } from "../components/github/export-to-github-popover";
import { ProjectTab } from "../components/project-tab";

interface Props {
  projectId: Id<"projects">;
}

export const ProjectIdSection: FC<Props> = ({ projectId }) => {
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");
  const isEditorActive = activeTab === "editor";

  return (
    <div className="h-full flex flex-col">
      {/* 顶部工具栏*/}
      <nav className="h-8.75 flex items-center bg-sidebar border-b">
        <ProjectTab
          label="代 码"
          isActive={isEditorActive}
          onClick={() => {
            setActiveTab("editor");
          }}
        />
        <ProjectTab
          label="预 览"
          isActive={!isEditorActive}
          onClick={() => {
            setActiveTab("preview");
          }}
        />
        {/* 导出到 GitHub 按钮 */}
        <div className="flex-1 flex justify-end h-full">
          <ExportToGithubPopover projectId={projectId} />
        </div>
      </nav>
      {/* 代码编辑区 */}
      <div className="flex-1 relative">
        <div
          className={cn(
            "absolute inset-0",
            isEditorActive ? "visible" : "invisible",
          )}
        >
          <Allotment defaultSizes={[DEFAULT_SIDEBAR_WIDTH, DEFAULT_MAIN_SIZE]}>
            <Allotment.Pane
              snap
              minSize={MIN_SIDEBAR_WIDTH}
              maxSize={MAX_SIDEBAR_WIDTH}
              preferredSize={DEFAULT_FILE_DIRECTORY_SIDEBAR_WIDTH}
            >
              {/* 文件目录侧边栏 */}
              <FileExplorer projectId={projectId} />
            </Allotment.Pane>
            <Allotment.Pane>
              {/* 代码编辑器 */}
              <EditorSection projectId={projectId} />
            </Allotment.Pane>
          </Allotment>
        </div>
        <div
          className={cn(
            "absolute inset-0",
            !isEditorActive ? "visible" : "invisible",
          )}
        >
          <PreviewSection projectId={projectId} enabled={!isEditorActive} />
        </div>
      </div>
    </div>
  );
};
