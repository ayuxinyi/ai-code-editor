"use client";

import { Allotment } from "allotment";
import type { FC, PropsWithChildren } from "react";

import {
  DEFAULT_CONVERSATION_SIDEBAR_WIDTH,
  DEFAULT_MAIN_SIZE,
  MAX_SIDEBAR_WIDTH,
  MIN_SIDEBAR_WIDTH,
} from "@/constants";
import { ConversationSection } from "@/features/conversations/ui/sections/conversation-section";

import type { Id } from "../../../../../convex/_generated/dataModel";
import { ConvexErrorBoundary } from "../components/convex-error-boundary";
import { ProjectNavbar } from "../components/project-navbar";

interface Props {
  projectId: Id<"projects">;
}
export const ProjectIdLayoutView: FC<PropsWithChildren<Props>> = ({
  children,
  projectId,
}) => {
  return (
    <ConvexErrorBoundary>
      <div className="w-full h-screen flex flex-col">
        <ProjectNavbar projectId={projectId} />
        <div className="flex-1 overflow-hidden flex">
          <Allotment
            className="flex-1"
            defaultSizes={[
              DEFAULT_CONVERSATION_SIDEBAR_WIDTH,
              DEFAULT_MAIN_SIZE,
            ]}
          >
            {/* 对话侧边栏，与AI对话 */}
            <Allotment.Pane
              snap
              minSize={MIN_SIDEBAR_WIDTH}
              maxSize={MAX_SIDEBAR_WIDTH}
              preferredSize={DEFAULT_CONVERSATION_SIDEBAR_WIDTH}
            >
              <ConversationSection projectId={projectId} />
            </Allotment.Pane>
            {/* 主内容区域，用于预览代码或者查看项目界面 */}
            <Allotment.Pane>{children}</Allotment.Pane>
          </Allotment>
        </div>
      </div>
    </ConvexErrorBoundary>
  );
};
