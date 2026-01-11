import type { FC, PropsWithChildren } from "react";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { getItemPadding } from "@/constants";
import { cn } from "@/lib/utils";

import type { Doc } from "../../../../../../convex/_generated/dataModel";

interface TreeItemWrapProps {
  item: Doc<"files">;
  level: number;
  isActive?: boolean;
  onClick?: () => void;
  onDoubleClick?: () => void;
  onRename?: () => void;
  onDelete?: () => void;
  onCreateFile?: () => void;
  onCreateFolder?: () => void;
}

export const TreeItemWrap: FC<PropsWithChildren<TreeItemWrapProps>> = ({
  item,
  level,
  isActive,
  onClick,
  onDoubleClick,
  onRename,
  onDelete,
  onCreateFile,
  onCreateFolder,
  children,
}) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <button
          onClick={onClick}
          onDoubleClick={onDoubleClick}
          onKeyDown={ev => {
            if (ev.key === "Enter") {
              ev.preventDefault();
              onRename?.();
            }
          }}
          className={cn(
            "group flex items-center gap-1 w-full h-5.5 hover:bg-accent/30 outline-none focus:ring-1 focus:ring-inset focus:ring-ring",
            isActive && "bg-accent/30"
          )}
          style={{ paddingLeft: getItemPadding(level, item.type === "file") }}
        >
          {children}
        </button>
      </ContextMenuTrigger>
      <ContextMenuContent
        onCloseAutoFocus={ev => ev.preventDefault()}
        className="w-64"
      >
        {item.type === "folder" && (
          <>
            <ContextMenuItem onClick={onCreateFile} className="text-sm">
              新建文件...
            </ContextMenuItem>
            <ContextMenuItem onClick={onCreateFolder} className="text-sm">
              新建文件夹...
            </ContextMenuItem>
          </>
        )}
        <ContextMenuItem onClick={onRename} className="text-sm">
          重命名...
          <ContextMenuShortcut>Enter</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onClick={onDelete} className="text-sm">
          永久删除
          <ContextMenuShortcut>Ctrl+Backspace</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
