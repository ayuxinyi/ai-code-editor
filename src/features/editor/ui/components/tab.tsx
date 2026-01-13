import { Vue } from "@react-symbols/icons/files";
import { FileIcon } from "@react-symbols/icons/utils";
import { XIcon } from "lucide-react";
import type { FC } from "react";

import { LoadingSwap } from "@/components/loading-swap";
import { useFileById } from "@/features/projects/hooks/use-files";
import { cn } from "@/lib/utils";

import type { Id } from "../../../../../convex/_generated/dataModel";
import { useEditor } from "../../hooks/use-editor";

interface TabProps {
  fileId: Id<"files">;
  projectId: Id<"projects">;
  isFirst: boolean;
}

export const Tab: FC<TabProps> = ({ fileId, projectId, isFirst }) => {
  const file = useFileById(fileId);
  const { activeTabId, previewTabId, setActiveTab, openFile, closeTab } =
    useEditor(projectId);

  const isActive = activeTabId === fileId;
  const isPreview = previewTabId === fileId;
  const fileName = file?.name ?? "加载中...";

  return (
    <div
      onClick={() => setActiveTab(fileId)}
      onDoubleClick={() => openFile(fileId, { pinned: true })}
      className={cn(
        "flex items-center gap-2 h-8.75 pl-2 pr-1.5 cursor-pointer text-muted-foreground group border-y border-x border-transparent hover:bg-accent/30",
        isActive &&
          "bg-background text-foreground border-x-border border-b-background -mb-px drop-shadow",
        isFirst && "border-l-transparent!"
      )}
    >
      <LoadingSwap isLoading={!file} loadingText="加载中...">
        <FileIcon
          className="size-4 shrink-0"
          fileName={fileName}
          autoAssign
          editFileExtensionData={{ vue: Vue }}
        />
        <span
          className={cn("text-sm whitespace-nowrap", isPreview && "italic")}
        >
          {fileName}
        </span>
        <button
          onClick={ev => {
            ev.preventDefault();
            ev.stopPropagation();
            closeTab(fileId);
          }}
          onKeyDown={ev => {
            if (ev.key === "Enter" || ev.key === " ") {
              ev.preventDefault();
              ev.stopPropagation();
              closeTab(fileId);
            }
          }}
          className={cn(
            "p-0.5 rounded-sm opacity-0 hover:bg-white/10 group-hover:opacity-100",
            isActive && "opacity-100"
          )}
        >
          <XIcon className="size-3.5" />
        </button>
      </LoadingSwap>
    </div>
  );
};
