"use client";

import { GitHubIcon } from "@daveyplate/better-auth-ui";
import { type FC, useState } from "react";

import { cn } from "@/lib/utils";

import type { Id } from "../../../../../convex/_generated/dataModel";
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
          <div>编 辑</div>
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
