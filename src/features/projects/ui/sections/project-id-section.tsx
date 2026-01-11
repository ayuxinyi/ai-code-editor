"use client";

import { GitHubIcon } from "@daveyplate/better-auth-ui";
import { Allotment } from "allotment";
import { type FC, useState } from "react";

import {
  DEFAULT_FILE_DIRECTORY_SIDEBAR_WIDTH,
  DEFAULT_MAIN_SIZE,
  DEFAULT_SIDEBAR_WIDTH,
  MAX_SIDEBAR_WIDTH,
  MIN_SIDEBAR_WIDTH,
} from "@/constants";
import { cn } from "@/lib/utils";

import type { Id } from "../../../../../convex/_generated/dataModel";
import { FileExplorer } from "../components/file-explorer";
import { ProjectTab } from "../components/project-tab";

interface Props {
  projectId: Id<"projects">;
}

export const ProjectIdSection: FC<Props> = ({ projectId }) => {
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");
  const isEditorActive = activeTab === "editor";

  return (
    <div className="h-full flex flex-col">
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
        <div className="flex-1 flex justify-end h-full">
          <div className="flex items-center gap-1.5 h-full px-3 cursor-pointer text-muted-foreground border-l hover:bg-accent/30">
            <GitHubIcon className="size-3.5" />
            <span className="text-sm">导出</span>
          </div>
        </div>
      </nav>
      <div className="flex-1 relative">
        <div
          className={cn(
            "absolute inset-0",
            isEditorActive ? "visible" : "invisible"
          )}
        >
          <Allotment defaultSizes={[DEFAULT_SIDEBAR_WIDTH, DEFAULT_MAIN_SIZE]}>
            <Allotment.Pane
              snap
              minSize={MIN_SIDEBAR_WIDTH}
              maxSize={MAX_SIDEBAR_WIDTH}
              preferredSize={DEFAULT_FILE_DIRECTORY_SIDEBAR_WIDTH}
            >
              <FileExplorer projectId={projectId} />
            </Allotment.Pane>
            <Allotment.Pane>代码编辑器</Allotment.Pane>
          </Allotment>
        </div>
        <div
          className={cn(
            "absolute inset-0",
            !isEditorActive ? "visible" : "invisible"
          )}
        >
          <div>预 览</div>
        </div>
      </div>
    </div>
  );
};
