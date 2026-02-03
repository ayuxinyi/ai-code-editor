"use client";

import { Allotment } from "allotment";
import {
  AlertTriangleIcon,
  Loader2Icon,
  RefreshCcwIcon,
  TerminalSquareIcon,
} from "lucide-react";
import { type FC, useState } from "react";

import { Button } from "@/components/ui/button";
import { useProjectById } from "@/features/projects/hooks/use-projects";

import type { Id } from "../../../../../convex/_generated/dataModel";
import { useWebContainer } from "../../hooks/use-webcontainer";
import { PreviewSettingsPopover } from "../components/preview-settings-popover";
import { PreviewTerminal } from "../components/preview-terminal";

interface PreviewSectionProps {
  projectId: Id<"projects">;
}

export const PreviewSection: FC<PreviewSectionProps> = ({ projectId }) => {
  const project = useProjectById(projectId);
  const [showTerminal, setShowTerminal] = useState(true);

  const { status, error, previewUrl, terminalOutput, restartWebContainer } =
    useWebContainer({
      projectId,
      enabled: true,
      settings: project?.settings,
    });

  const isLoading = status === "booting" || status === "installing";

  return (
    <div className="h-full flex flex-col bg-background">
      {/* 预览容器操作栏 */}
      <div className="h-8.75 flex items-center border-b bg-sidebar shrink-0">
        {/* 重启预览容器 */}
        <Button
          size="sm"
          variant="ghost"
          className="h-full rounded-none"
          disabled={isLoading}
          onClick={restartWebContainer}
          title="Restart container"
          aria-label="Restart container"
        >
          <RefreshCcwIcon className="size-3" />
        </Button>
        {/* 展示预览容器 URL */}
        <div className="flex-1 h-full flex items-center px-3 bg-background border-x text-xs text-muted-foreground truncate font-mono">
          {isLoading && (
            <div className="flex items-center gap-1.5">
              <Loader2Icon className="size-3 animate-spin" />
              {status === "booting" ? "Starting..." : "Installing..."}
            </div>
          )}
          {previewUrl && <span className="truncate">{previewUrl}</span>}
          {!isLoading && !previewUrl && !error && <span>Ready to preview</span>}
        </div>
        {/* 展示终端设置弹窗 */}
        <Button
          size="sm"
          variant="ghost"
          className="h-full rounded-none"
          title="Toggle terminal"
          aria-label="Toggle terminal"
          onClick={() => setShowTerminal(prev => !prev)}
        >
          <TerminalSquareIcon className="size-3" />
        </Button>
        <PreviewSettingsPopover
          projectId={projectId}
          initialValues={project?.settings}
          onSave={restartWebContainer}
        />
      </div>

      {/* 预览区域 */}
      <div className="flex-1 min-h-0">
        <Allotment vertical>
          {/* 预览容器错误信息 */}
          <Allotment.Pane>
            {error && (
              <div className="size-full flex items-center justify-center text-muted-foreground">
                <div className="flex flex-col items-center gap-2 max-w-md mx-auto text-center">
                  <AlertTriangleIcon className="size-6" />
                  <p className="text-sm font-medium">{error}</p>
                  <Button
                    size="sm"
                    onClick={restartWebContainer}
                    variant="outline"
                  >
                    <RefreshCcwIcon className="size-4" />
                    Restart
                  </Button>
                </div>
              </div>
            )}
            {isLoading && !error && (
              <div className="size-full items-center flex justify-center text-muted-foreground">
                <div className="flex flex-col items-center gap-2 max-w-md mx-auto text-center">
                  <Loader2Icon className="size-6 animate-spin" />
                  <p className="text-sm font-medium">
                    {status === "booting" ? "Starting..." : "Installing..."}
                  </p>
                </div>
              </div>
            )}
            {previewUrl && (
              <iframe
                src={previewUrl}
                className="size-full border-0"
                title="Preview"
                aria-label="Preview"
              />
            )}
          </Allotment.Pane>
          {showTerminal && (
            <Allotment.Pane minSize={100} maxSize={500} preferredSize={200}>
              <div className="h-full flex flex-col bg-background border-t">
                <div className="h-7 flex items-center px-3 text-xs gap-1.5 text-muted-foreground border-b border-border/50 shrink-0">
                  <TerminalSquareIcon className="size-3" />
                  Terminal
                </div>
                <PreviewTerminal output={terminalOutput} />
              </div>
            </Allotment.Pane>
          )}
        </Allotment>
      </div>
    </div>
  );
};
