import {
  ChevronRightIcon,
  CopyMinusIcon,
  FilePlusCornerIcon,
  FolderPlusIcon,
} from "lucide-react";
import type { FC } from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useFileCreate,
  useFolderContents,
  useFolderCreate,
} from "@/features/projects/hooks/use-files";
import { useProjectById } from "@/features/projects/hooks/use-projects";
import { cn } from "@/lib/utils";
import { errorParse } from "@/utils/error-parse";

import type { Id } from "../../../../../../convex/_generated/dataModel";
import { CreateInput } from "./create-input";
import { LoadingRow } from "./loading-row";
import { Tree } from "./tree";

interface Props {
  projectId: Id<"projects">;
}

export const FileExplorer: FC<Props> = ({ projectId }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [collapseKey, setCollapseKey] = useState(0);
  const [creating, setCreating] = useState<"file" | "folder" | null>(null);

  // 获取当前项目信息
  const projects = useProjectById(projectId);
  // 获取根目录文件
  const rootFiles = useFolderContents({
    projectId,
    parentId: undefined,
    enabled: isOpen,
  });

  const createFile = useFileCreate();
  const createFolder = useFolderCreate();
  const handleCreate = async (name: string) => {
    try {
      if (creating === "file") {
        await createFile({
          projectId,
          parentId: undefined,
          name,
          content: "",
        });
      } else if (creating === "folder") {
        await createFolder({
          projectId,
          parentId: undefined,
          name,
        });
      }
    } catch (error) {
      errorParse(error);
    } finally {
      setCreating(null);
    }
  };

  return (
    <div className="h-full bg-sidebar">
      <ScrollArea>
        <div
          className="group/project cursor-pointer w-full text-left flex items-center gap-0.5 h-5.5 bg-accent font-bold"
          role="button"
          onClick={() => {
            setIsOpen(prev => !prev);
          }}
        >
          <ChevronRightIcon
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform",
              isOpen && "rotate-90",
            )}
          />
          <p className="text-sm uppercase line-clamp-1">
            {projects?.name ?? "加载中..."}
          </p>
          <div className="opacity-0 group-hover/project:opacity-100 transition-none duration-0 flex items-center gap-0.5 ml-auto">
            {/* 创建文件 */}
            <Button
              onClick={ev => {
                ev.stopPropagation();
                ev.preventDefault();
                setIsOpen(true);
                setCreating("file");
              }}
              variant="highlight"
              size="icon-xs"
            >
              <FilePlusCornerIcon className="size-3.5" />
            </Button>
            {/* 创建文件夹 */}
            <Button
              onClick={ev => {
                ev.stopPropagation();
                ev.preventDefault();
                setIsOpen(true);
                setCreating("folder");
              }}
              variant="highlight"
              size="icon-xs"
            >
              <FolderPlusIcon className="size-3.5" />
            </Button>
            {/* 折叠文件夹 */}
            <Button
              onClick={ev => {
                ev.stopPropagation();
                ev.preventDefault();
                setCollapseKey(prev => prev + 1);
              }}
              variant="highlight"
              size="icon-xs"
            >
              <CopyMinusIcon className="size-3.5" />
            </Button>
          </div>
        </div>
        {isOpen && (
          <>
            {rootFiles === undefined && <LoadingRow level={0} />}
            {creating && (
              <CreateInput
                type={creating}
                level={0}
                onSubmit={handleCreate}
                onCancel={() => setCreating(null)}
              />
            )}
            {rootFiles?.map(item => (
              <Tree
                key={`${item._id}-${collapseKey}`}
                item={item}
                level={0}
                projectId={projectId}
              />
            ))}
          </>
        )}
      </ScrollArea>
    </div>
  );
};
